"""FastAPI application entry point.

Run locally with::

    uvicorn app.main:app --reload --port 8000

Interactive docs are served at ``/docs`` (Swagger) and ``/redoc``.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import settings
from app.core.logging import configure_logging, get_logger

configure_logging()
logger = get_logger(__name__)


def create_app() -> FastAPI:
    """Application factory — keeps construction testable and explicit."""
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "Detect hidden market regimes and forecast stock prices using "
            "Gaussian Hidden Markov Models."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )

    app.include_router(router, prefix="/api/v1")

    @app.get("/", tags=["system"])
    def root() -> dict[str, str]:
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs",
            "health": "/api/v1/health",
        }

    logger.info(
        "%s v%s started (env=%s)",
        settings.app_name,
        settings.app_version,
        settings.environment,
    )
    return app


app = create_app()
