"""FastAPI application entry point.

Run locally with::

    uvicorn app.main:app --reload --port 8000

Interactive docs are served at ``/docs`` (Swagger) and ``/redoc``.
Operational endpoints: ``/api/v1/health``, ``/api/v1/ready``, ``/metrics``.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.cache import cache
from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.core.metrics import metrics_enabled, render_latest
from app.core.middleware import ObservabilityMiddleware, RateLimitMiddleware

configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Startup/shutdown hooks."""
    logger.info(
        "%s v%s starting (env=%s, auth=%s, cache_ttl=%ds, metrics=%s)",
        settings.app_name,
        settings.app_version,
        settings.environment,
        settings.auth_enabled,
        settings.cache_ttl_seconds,
        metrics_enabled(),
    )
    yield
    logger.info("%s shutting down", settings.app_name)


def create_app() -> FastAPI:
    """Application factory — keeps construction testable and explicit."""
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "Detect hidden market regimes and forecast stock prices using "
            "Gaussian Hidden Markov Models. Includes automatic regime-count "
            "selection (BIC/AIC) and walk-forward backtesting."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # Order matters: rate-limit first (cheap reject), then observability wraps
    # the whole stack so even rate-limited requests are timed and logged.
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(ObservabilityMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*", "X-API-Key", "X-Request-ID"],
        expose_headers=["X-Request-ID", "X-Response-Time-ms", "X-RateLimit-Remaining"],
    )

    app.include_router(router, prefix="/api/v1")

    @app.get("/", tags=["system"])
    def root() -> dict[str, str]:
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs",
            "health": "/api/v1/health",
            "ready": "/api/v1/ready",
            "metrics": "/metrics",
        }

    if settings.metrics_enabled:

        @app.get("/metrics", tags=["system"], include_in_schema=False)
        def metrics() -> Response:
            payload, content_type = render_latest()
            return Response(content=payload, media_type=content_type)

    @app.get("/api/v1/cache/stats", tags=["system"], include_in_schema=False)
    def cache_stats() -> dict[str, int]:
        return cache.stats()

    return app


app = create_app()
