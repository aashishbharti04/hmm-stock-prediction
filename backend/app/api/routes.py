"""HTTP API routes for the HMM analysis service."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.stock import AnalysisRequest, AnalysisResponse, HealthResponse
from app.services.analysis import run_analysis
from app.services.exceptions import (
    DataUnavailableError,
    InsufficientDataError,
    ModelFitError,
)

logger = get_logger(__name__)

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["system"])
def health() -> HealthResponse:
    """Liveness/readiness probe."""
    return HealthResponse(
        status="ok",
        version=settings.app_version,
        environment=settings.environment,
    )


@router.post("/analyze", response_model=AnalysisResponse, tags=["analysis"])
def analyze(payload: AnalysisRequest) -> AnalysisResponse:
    """Fetch market data, fit an HMM, and return regimes + forecast.

    All input is validated by ``AnalysisRequest``. Domain errors are mapped to
    appropriate HTTP status codes; unexpected errors surface as 500 without
    leaking internals.
    """
    try:
        return run_analysis(
            ticker=payload.ticker,
            period=payload.period,
            interval=payload.interval,
            n_states=payload.n_states,
            forecast_days=payload.forecast_days,
        )
    except InsufficientDataError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc
    except DataUnavailableError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except ModelFitError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Model fitting failed. Try a different ticker or fewer states.",
        ) from exc
    except Exception as exc:  # noqa: BLE001 - last-resort guard
        logger.exception("Unhandled error during analysis: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error.",
        ) from exc


@router.get("/analyze", response_model=AnalysisResponse, tags=["analysis"])
def analyze_get(
    ticker: str = settings.default_ticker,
    period: str = settings.default_period,
    interval: str = settings.default_interval,
    n_states: int = settings.default_hidden_states,
    forecast_days: int = 5,
) -> AnalysisResponse:
    """Convenience GET wrapper around ``/analyze`` for quick links and demos."""
    payload = AnalysisRequest(
        ticker=ticker,
        period=period,
        interval=interval,
        n_states=n_states,
        forecast_days=forecast_days,
    )
    return analyze(payload)
