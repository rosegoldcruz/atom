"""
Prometheus metrics setup and middleware for ATOM API.
"""

import time
import structlog
from typing import Dict, Any
from fastapi import Request, Response
from prometheus_client import Counter, Histogram, Gauge, CollectorRegistry, REGISTRY

logger = structlog.get_logger("atom.api.metrics")

# Create custom registry for better control
custom_registry = CollectorRegistry()

# HTTP Metrics
http_requests_total = Counter(
    "atom_api_http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status_code"],
    registry=custom_registry
)

http_request_duration_seconds = Histogram(
    "atom_api_http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "endpoint"],
    registry=custom_registry
)

http_requests_in_progress = Gauge(
    "atom_api_http_requests_in_progress",
    "HTTP requests currently in progress",
    registry=custom_registry
)

# Business Metrics
arbitrage_opportunities_detected = Counter(
    "atom_arbitrage_opportunities_detected_total",
    "Total arbitrage opportunities detected",
    ["strategy", "asset_pair"],
    registry=custom_registry
)

arbitrage_executions = Counter(
    "atom_arbitrage_executions_total",
    "Total arbitrage executions",
    ["strategy", "asset", "status"],
    registry=custom_registry
)

arbitrage_profit_usd = Counter(
    "atom_arbitrage_profit_usd_total",
    "Total arbitrage profit in USD",
    ["strategy", "asset"],
    registry=custom_registry
)

arbitrage_gas_used = Counter(
    "atom_arbitrage_gas_used_total",
    "Total gas used for arbitrage",
    ["strategy", "asset"],
    registry=custom_registry
)

# System Metrics
redis_operations = Counter(
    "atom_redis_operations_total",
    "Total Redis operations",
    ["operation", "status"],
    registry=custom_registry
)

circuit_breaker_trips = Counter(
    "atom_circuit_breaker_trips_total",
    "Total circuit breaker trips",
    ["strategy", "reason"],
    registry=custom_registry
)

rate_limit_hits = Counter(
    "atom_rate_limit_hits_total",
    "Total rate limit hits",
    ["endpoint", "client_ip"],
    registry=custom_registry
)

# Authentication Metrics
auth_attempts = Counter(
    "atom_auth_attempts_total",
    "Total authentication attempts",
    ["status"],
    registry=custom_registry
)

# Error Metrics
errors_total = Counter(
    "atom_errors_total",
    "Total errors",
    ["error_type", "endpoint"],
    registry=custom_registry
)

def setup_metrics():
    """Initialize metrics system."""
    logger.info("Setting up Prometheus metrics")
    
    # Register custom metrics with the default registry
    for collector in custom_registry._collector_to_names:
        try:
            REGISTRY.register(collector)
        except ValueError:
            # Already registered
            pass

async def metrics_middleware(request: Request, call_next) -> Response:
    """Middleware to collect HTTP metrics."""
    
    # Start timing
    start_time = time.time()
    http_requests_in_progress.inc()
    
    try:
        # Process request
        response = await call_next(request)
        
        # Record metrics
        duration = time.time() - start_time
        method = request.method
        endpoint = _get_endpoint_name(request)
        status_code = str(response.status_code)
        
        http_requests_total.labels(
            method=method,
            endpoint=endpoint,
            status_code=status_code
        ).inc()
        
        http_request_duration_seconds.labels(
            method=method,
            endpoint=endpoint
        ).observe(duration)
        
        # Add metrics headers
        response.headers["X-Response-Time"] = f"{duration:.3f}s"
        
        return response
        
    except Exception as e:
        # Record error metrics
        duration = time.time() - start_time
        method = request.method
        endpoint = _get_endpoint_name(request)
        
        errors_total.labels(
            error_type=type(e).__name__,
            endpoint=endpoint
        ).inc()
        
        http_requests_total.labels(
            method=method,
            endpoint=endpoint,
            status_code="500"
        ).inc()
        
        http_request_duration_seconds.labels(
            method=method,
            endpoint=endpoint
        ).observe(duration)
        
        raise
        
    finally:
        http_requests_in_progress.dec()

def _get_endpoint_name(request: Request) -> str:
    """Extract endpoint name from request for metrics."""
    path = request.url.path
    
    # Normalize common patterns
    if path.startswith("/api/"):
        parts = path.split("/")
        if len(parts) >= 3:
            return f"/api/{parts[2]}"
    
    # Common endpoints
    if path in ["/", "/health", "/metrics", "/docs", "/redoc"]:
        return path
    
    # Default to path
    return path

def record_arbitrage_opportunity(strategy: str, asset_pair: str):
    """Record an arbitrage opportunity detection."""
    arbitrage_opportunities_detected.labels(
        strategy=strategy,
        asset_pair=asset_pair
    ).inc()

def record_arbitrage_execution(strategy: str, asset: str, status: str, profit_usd: float = 0, gas_used: int = 0):
    """Record an arbitrage execution."""
    arbitrage_executions.labels(
        strategy=strategy,
        asset=asset,
        status=status
    ).inc()
    
    if profit_usd > 0:
        arbitrage_profit_usd.labels(
            strategy=strategy,
            asset=asset
        ).inc(profit_usd)
    
    if gas_used > 0:
        arbitrage_gas_used.labels(
            strategy=strategy,
            asset=asset
        ).inc(gas_used)

def record_circuit_breaker_trip(strategy: str, reason: str):
    """Record a circuit breaker trip."""
    circuit_breaker_trips.labels(
        strategy=strategy,
        reason=reason
    ).inc()

def record_redis_operation(operation: str, status: str):
    """Record a Redis operation."""
    redis_operations.labels(
        operation=operation,
        status=status
    ).inc()

def record_rate_limit_hit(endpoint: str, client_ip: str):
    """Record a rate limit hit."""
    rate_limit_hits.labels(
        endpoint=endpoint,
        client_ip=client_ip
    ).inc()

def record_auth_attempt(status: str):
    """Record an authentication attempt."""
    auth_attempts.labels(status=status).inc()

def get_metrics_summary() -> Dict[str, Any]:
    """Get a summary of current metrics."""
    return {
        "http_requests_total": http_requests_total._value._value,
        "arbitrage_opportunities_detected": arbitrage_opportunities_detected._value._value,
        "arbitrage_executions": arbitrage_executions._value._value,
        "circuit_breaker_trips": circuit_breaker_trips._value._value,
        "errors_total": errors_total._value._value,
    }