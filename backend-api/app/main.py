#!/usr/bin/env python3
"""
Production-hardened FastAPI application with structured logging, metrics, and security.
"""

import os
import sys
import logging
import structlog
from typing import Optional
from contextlib import asynccontextmanager

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from sentry_sdk.integrations.redis import RedisIntegration

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.responses import Response

from .middleware.auth import ClerkJWTMiddleware
from .metrics import setup_metrics, metrics_middleware
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

# Configure structured logging
def configure_logging():
    """Configure structured logging with JSON output for production."""
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    
    # Configure structlog
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
    
    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, log_level)
    )

# Initialize Sentry
def init_sentry():
    """Initialize Sentry error tracking if configured."""
    sentry_dsn = os.getenv("SENTRY_DSN")
    if sentry_dsn:
        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[
                FastApiIntegration(auto_enabling_integrations=False),
                StarletteIntegration(auto_enabling_integrations=False),
                RedisIntegration(),
            ],
            traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
            environment=os.getenv("ENVIRONMENT", "production"),
            release=os.getenv("APP_VERSION", "unknown"),
        )

# Rate limiting
def get_remote_address(request: Request) -> str:
    """Get client IP for rate limiting, considering proxy headers."""
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

limiter = Limiter(key_func=get_remote_address)

# Application lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger = structlog.get_logger("atom.api.startup")
    
    # Startup
    logger.info("Starting ATOM API", version=os.getenv("APP_VERSION", "unknown"))
    
    # Initialize metrics
    setup_metrics()
    
    # Bootstrap metrics from Redis if available
    try:
        from app.metrics_store import bootstrap_from_redis
        await bootstrap_from_redis()
        logger.info("Metrics bootstrapped from Redis")
    except Exception as e:
        logger.warning("Failed to bootstrap metrics from Redis", error=str(e))
    
    yield
    
    # Shutdown
    logger.info("Shutting down ATOM API")

# Initialize logging and Sentry
configure_logging()
init_sentry()

logger = structlog.get_logger("atom.api")

# Create FastAPI app
app = FastAPI(
    title="ATOM Arbitrage API",
    version=os.getenv("APP_VERSION", "1.0.0"),
    description="Production arbitrage backend for ATOM with security hardening",
    lifespan=lifespan,
    docs_url="/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") != "production" else None,
)

# CORS Configuration - Strict for production
cors_origins_env = os.getenv("CORS_ALLOW_ORIGINS", "https://dashboard.aeoninvestmentstechnologies.com")
origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]

# Validate origins for production
if os.getenv("ENVIRONMENT") == "production":
    allowed_domains = ["aeoninvestmentstechnologies.com", "vercel.app"]
    for origin in origins:
        if origin != "*" and not any(domain in origin for domain in allowed_domains):
            logger.warning("Potentially unsafe CORS origin", origin=origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
)

# Trusted Hosts
trusted_hosts_env = os.getenv("TRUSTED_HOSTS", "*")
if trusted_hosts_env != "*":
    trusted_hosts = [h.strip() for h in trusted_hosts_env.split(",") if h.strip()]
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=trusted_hosts)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Clerk JWT Authentication Middleware
clerk_middleware = ClerkJWTMiddleware()
app.add_middleware(type(clerk_middleware), instance=clerk_middleware)

# Metrics middleware
@app.middleware("http")
async def _metrics_middleware(request: Request, call_next):
    return await metrics_middleware(request, call_next)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler with structured logging."""
    logger.error(
        "Unhandled exception",
        path=request.url.path,
        method=request.method,
        error=str(exc),
        exc_info=True
    )
    
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.detail}
        )
    
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )

# Health endpoints
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "status": "ok",
        "service": "atom-backend-api",
        "version": os.getenv("APP_VERSION", "unknown"),
        "environment": os.getenv("ENVIRONMENT", "unknown")
    }

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"ok": True, "timestamp": structlog.processors.TimeStamper(fmt="iso")()}

@app.get("/health/ready")
async def readiness():
    """Readiness check endpoint."""
    # Add checks for dependencies (Redis, database, etc.)
    checks = {}
    
    # Redis check
    try:
        from app.metrics_store import get_redis
        redis = get_redis()
        await redis.ping()
        checks["redis"] = "ok"
    except Exception as e:
        checks["redis"] = f"error: {str(e)}"
    
    all_ok = all(status == "ok" for status in checks.values())
    status_code = 200 if all_ok else 503
    
    return JSONResponse(
        status_code=status_code,
        content={"ready": all_ok, "checks": checks}
    )

# Prometheus metrics endpoint
@app.get("/metrics")
async def prometheus_metrics():
    """Prometheus metrics endpoint."""
    data = generate_latest()
    return Response(content=data, media_type=CONTENT_TYPE_LATEST)

# Include routers
from api import metrics as metrics_router
app.include_router(metrics_router.router)

from api import addresses as addresses_router
app.include_router(addresses_router.router)

from api import stablecoin as stablecoin_router
app.include_router(stablecoin_router.router)

from api import volatility as volatility_router
app.include_router(volatility_router.router)

from api import triangular as triangular_router
app.include_router(triangular_router.router)

from api import mev as mev_router
app.include_router(mev_router.router)

from api import liquidity as liquidity_router
app.include_router(liquidity_router.router)

from api import stat_arb as stat_arb_router
app.include_router(stat_arb_router.router)

# Protected API routers
try:
    from app.routers import health as health_router
    app.include_router(health_router.router)
except ImportError:
    logger.info("Health router not available")

try:
    from app.routers import admin as admin_router
    app.include_router(admin_router.router)
except ImportError:
    logger.info("Admin router not available")

try:
    from app.routers import trigger as trigger_router
    app.include_router(trigger_router.router)
except ImportError:
    logger.info("Trigger router not available")

try:
    from app.routers import dashboard as dashboard_router
    app.include_router(dashboard_router.router)
except ImportError:
    logger.info("Dashboard router not available")

try:
    from app.routers import internal_metrics as internal_metrics_router
    app.include_router(internal_metrics_router.router)
except ImportError:
    logger.info("Internal metrics router not available")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        log_config=None,  # Use our structured logging
        access_log=False,  # Disable uvicorn access logs
    )