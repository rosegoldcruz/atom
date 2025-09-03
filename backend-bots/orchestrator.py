#!/usr/bin/env python3
"""
Production-hardened bot orchestrator with circuit breakers, kill switches, and monitoring.
"""

import os
import sys
import asyncio
import signal
import logging
import structlog
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import json

import sentry_sdk
from sentry_sdk.integrations.redis import RedisIntegration
from prometheus_client import Counter, Gauge, Histogram, start_http_server

from backend_bots.atom_core import get_redis
from backend_bots.atom_core.rpc_pool import with_w3
from backend_bots.atom_core.safe_async import guard, CircuitBreaker
from backend_bots.atom_core.gas import dynamic_gas_cap

# Configure structured logging
def configure_logging():
    """Configure structured logging."""
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, log_level)
    )

# Initialize Sentry
def init_sentry():
    """Initialize Sentry error tracking."""
    sentry_dsn = os.getenv("SENTRY_DSN")
    if sentry_dsn:
        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[RedisIntegration()],
            traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
            environment=os.getenv("ENVIRONMENT", "production"),
            release=os.getenv("APP_VERSION", "unknown"),
        )

configure_logging()
init_sentry()

logger = structlog.get_logger("atom.orchestrator")

# Prometheus Metrics
signals_processed = Counter("atom_signals_processed_total", "Total signals processed", ["stream", "status"])
signals_failed = Counter("atom_signals_failed_total", "Total failed signal processing", ["stream", "reason"])
last_signal_timestamp = Gauge("atom_last_signal_timestamp", "Unix timestamp of last signal", ["stream"])
current_gas_cap = Gauge("atom_current_gas_cap_wei", "Current dynamic gas cap in wei")
circuit_breaker_state = Gauge("atom_circuit_breaker_state", "Circuit breaker state (0=closed, 1=open)", ["stream"])
signal_processing_duration = Histogram("atom_signal_processing_duration_seconds", "Signal processing duration", ["stream"])
orchestrator_uptime = Gauge("atom_orchestrator_uptime_seconds", "Orchestrator uptime in seconds")
kill_switch_active = Gauge("atom_kill_switch_active", "Kill switch state (0=inactive, 1=active)")

@dataclass
class StreamConfig:
    """Configuration for a Redis stream."""
    name: str
    label: str
    enabled: bool = True
    max_batch_size: int = 10
    timeout_ms: int = 100
    circuit_breaker: Optional[CircuitBreaker] = None

@dataclass
class BackoffConfig:
    """Exponential backoff configuration."""
    initial_delay: float = 1.0
    max_delay: float = 300.0
    multiplier: float = 2.0
    jitter: bool = True

class KillSwitch:
    """Global kill switch for emergency shutdown."""
    
    def __init__(self, redis_key: str = "atom:kill_switch"):
        self.redis_key = redis_key
        self._active = False
    
    async def check(self) -> bool:
        """Check if kill switch is active."""
        try:
            redis = get_redis()
            result = await redis.get(self.redis_key)
            self._active = result == b"1" if result else False
            kill_switch_active.set(1 if self._active else 0)
            return self._active
        except Exception as e:
            logger.error("Failed to check kill switch", error=str(e))
            return False
    
    async def activate(self, reason: str = "Manual activation"):
        """Activate kill switch."""
        try:
            redis = get_redis()
            await redis.set(self.redis_key, "1")
            await redis.expire(self.redis_key, 3600)  # Auto-expire in 1 hour
            self._active = True
            logger.critical("Kill switch activated", reason=reason)
            kill_switch_active.set(1)
        except Exception as e:
            logger.error("Failed to activate kill switch", error=str(e))
    
    async def deactivate(self):
        """Deactivate kill switch."""
        try:
            redis = get_redis()
            await redis.delete(self.redis_key)
            self._active = False
            logger.info("Kill switch deactivated")
            kill_switch_active.set(0)
        except Exception as e:
            logger.error("Failed to deactivate kill switch", error=str(e))
    
    @property
    def active(self) -> bool:
        return self._active

class ExponentialBackoff:
    """Exponential backoff with jitter."""
    
    def __init__(self, config: BackoffConfig):
        self.config = config
        self.current_delay = config.initial_delay
        self.failure_count = 0
    
    async def wait(self):
        """Wait for the current delay period."""
        if self.failure_count > 0:
            delay = min(self.current_delay, self.config.max_delay)
            if self.config.jitter:
                import random
                delay *= (0.5 + random.random() * 0.5)  # Add 0-50% jitter
            
            logger.info("Backing off", delay=delay, failure_count=self.failure_count)
            await asyncio.sleep(delay)
    
    def on_failure(self):
        """Record a failure and increase delay."""
        self.failure_count += 1
        self.current_delay *= self.config.multiplier
    
    def on_success(self):
        """Record a success and reset delay."""
        if self.failure_count > 0:
            logger.info("Backoff reset after success", previous_failures=self.failure_count)
        self.failure_count = 0
        self.current_delay = self.config.initial_delay

class BotOrchestrator:
    """Main orchestrator for arbitrage bots."""
    
    def __init__(self):
        self.start_time = datetime.utcnow()
        self.kill_switch = KillSwitch()
        self.backoff = ExponentialBackoff(BackoffConfig())
        self.shutdown_event = asyncio.Event()
        
        # Stream configurations
        self.streams = [
            StreamConfig(
                name=os.getenv("ARB_STREAM", "atom:signals"),
                label="arb",
                circuit_breaker=CircuitBreaker(fail_max=5, reset_after=30)
            ),
            StreamConfig(
                name=os.getenv("MEV_STREAM", "atom:opps:mev"),
                label="mev",
                circuit_breaker=CircuitBreaker(fail_max=3, reset_after=60)
            ),
        ]
        
        # Track last processed IDs
        self.last_ids = {stream.label: "$" for stream in self.streams}
        
        # Setup signal handlers
        self._setup_signal_handlers()
    
    def _setup_signal_handlers(self):
        """Setup graceful shutdown signal handlers."""
        def signal_handler(signum, frame):
            logger.info("Received shutdown signal", signal=signum)
            self.shutdown_event.set()
        
        signal.signal(signal.SIGTERM, signal_handler)
        signal.signal(signal.SIGINT, signal_handler)
    
    async def start(self):
        """Start the orchestrator."""
        logger.info("Starting ATOM Bot Orchestrator", version=os.getenv("APP_VERSION", "unknown"))
        
        # Start Prometheus metrics server
        metrics_port = int(os.getenv("METRICS_PORT", "9090"))
        start_http_server(metrics_port)
        logger.info("Metrics server started", port=metrics_port)
        
        # Main processing loop
        try:
            await self._main_loop()
        except Exception as e:
            logger.critical("Orchestrator crashed", error=str(e), exc_info=True)
            sentry_sdk.capture_exception(e)
            raise
        finally:
            logger.info("Orchestrator shutdown complete")
    
    async def _main_loop(self):
        """Main processing loop."""
        redis = get_redis()
        
        while not self.shutdown_event.is_set():
            try:
                # Update uptime metric
                uptime = (datetime.utcnow() - self.start_time).total_seconds()
                orchestrator_uptime.set(uptime)
                
                # Check kill switch
                if await self.kill_switch.check():
                    logger.warning("Kill switch is active, skipping processing")
                    await asyncio.sleep(5)
                    continue
                
                # Update gas cap
                try:
                    gas_cap = await dynamic_gas_cap()
                    current_gas_cap.set(gas_cap)
                except Exception as e:
                    logger.warning("Failed to update gas cap", error=str(e))
                
                # Process streams
                processed_any = False
                for stream in self.streams:
                    if not stream.enabled:
                        continue
                    
                    try:
                        processed = await self._process_stream(redis, stream)
                        if processed:
                            processed_any = True
                    except Exception as e:
                        logger.error("Stream processing failed", stream=stream.label, error=str(e))
                        signals_failed.labels(stream=stream.label, reason=type(e).__name__).inc()
                        stream.circuit_breaker.record_failure() if stream.circuit_breaker else None
                
                # Backoff handling
                if processed_any:
                    self.backoff.on_success()
                else:
                    await self.backoff.wait()
                
                # Small yield to prevent tight loop
                await asyncio.sleep(0.01)
                
            except Exception as e:
                logger.error("Main loop error", error=str(e), exc_info=True)
                self.backoff.on_failure()
                await self.backoff.wait()
    
    async def _process_stream(self, redis, stream: StreamConfig) -> bool:
        """Process a single stream."""
        # Check circuit breaker
        if stream.circuit_breaker and stream.circuit_breaker.is_open:
            circuit_breaker_state.labels(stream=stream.label).set(1)
            return False
        
        circuit_breaker_state.labels(stream=stream.label).set(0)
        
        try:
            # Read from stream
            resp = await redis.xread(
                {stream.name: self.last_ids[stream.label]},
                count=stream.max_batch_size,
                block=stream.timeout_ms
            )
            
            if not resp:
                return False
            
            _, entries = resp[0]
            processed_count = 0
            
            for entry_id, fields in entries:
                try:
                    start_time = asyncio.get_event_loop().time()
                    
                    # Process signal
                    await self._handle_signal(stream.label, fields)
                    
                    # Update metrics
                    duration = asyncio.get_event_loop().time() - start_time
                    signal_processing_duration.labels(stream=stream.label).observe(duration)
                    signals_processed.labels(stream=stream.label, status="success").inc()
                    
                    # Update last processed ID
                    self.last_ids[stream.label] = entry_id
                    last_signal_timestamp.labels(stream=stream.label).set(
                        float(entry_id.decode().split("-")[0]) / 1000.0
                    )
                    
                    processed_count += 1
                    
                    # Record success for circuit breaker
                    if stream.circuit_breaker:
                        stream.circuit_breaker.record_success()
                    
                except Exception as e:
                    logger.error("Signal processing failed", 
                               stream=stream.label, 
                               entry_id=entry_id, 
                               error=str(e))
                    signals_failed.labels(stream=stream.label, reason=type(e).__name__).inc()
                    
                    # Record failure for circuit breaker
                    if stream.circuit_breaker:
                        stream.circuit_breaker.record_failure()
            
            return processed_count > 0
            
        except Exception as e:
            logger.error("Stream read failed", stream=stream.label, error=str(e))
            if stream.circuit_breaker:
                stream.circuit_breaker.record_failure()
            raise
    
    async def _handle_signal(self, stream_label: str, signal_data: Dict[str, Any]):
        """Handle a single signal."""
        logger.debug("Processing signal", stream=stream_label, data=signal_data)
        
        # Validate signal data
        if not signal_data:
            raise ValueError("Empty signal data")
        
        # Extract signal information
        signal_type = signal_data.get(b"type", b"unknown").decode()
        asset = signal_data.get(b"asset", b"unknown").decode()
        
        # Route to appropriate handler
        if stream_label == "arb":
            await self._handle_arbitrage_signal(signal_data)
        elif stream_label == "mev":
            await self._handle_mev_signal(signal_data)
        else:
            logger.warning("Unknown stream label", stream=stream_label)
    
    async def _handle_arbitrage_signal(self, signal_data: Dict[str, Any]):
        """Handle arbitrage opportunity signal."""
        # Validate route using web3
        async def validate_route(w3):
            # Basic validation - check chain ID
            chain_id = w3.eth.chain_id
            logger.debug("Validating route", chain_id=chain_id)
            
            # Add more sophisticated validation here:
            # - Check token balances
            # - Validate router addresses
            # - Calculate slippage
            # - Check gas price
            
            return True
        
        # Execute with circuit breaker protection
        result = await guard(
            with_w3(validate_route),
            timeout=15,
            retries=2,
            breaker=CircuitBreaker(fail_max=3, reset_after=30)
        )
        
        if result:
            logger.info("Arbitrage signal validated", data=signal_data)
        else:
            logger.warning("Arbitrage signal validation failed", data=signal_data)
    
    async def _handle_mev_signal(self, signal_data: Dict[str, Any]):
        """Handle MEV opportunity signal."""
        # Similar to arbitrage but with MEV-specific logic
        logger.info("MEV signal received", data=signal_data)
        
        # Add MEV-specific validation and processing
        # This could include:
        # - Mempool analysis
        # - Gas price optimization
        # - Bundle submission logic

async def main():
    """Main entry point."""
    orchestrator = BotOrchestrator()
    
    try:
        await orchestrator.start()
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
    except Exception as e:
        logger.critical("Orchestrator failed", error=str(e), exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())