"""HTTP API routes for the HMM analysis service."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.cache import cache
from app.core.config import settings
from app.core.logging import get_logger
from app.core.metrics import metrics_enabled
from app.core.security import require_api_key
from app.schemas.stock import (
    AnalysisRequest,
    AnalysisResponse,
    BacktestRequest,
    BacktestResponse,
    HealthResponse,
    ReadinessResponse,
)
from app.services.analysis import run_analysis, run_backtest
from app.services.exceptions import (
    DataUnavailableError,
    InsufficientDataError,
    ModelFitError,
)

logger = get_logger(__name__)

router = APIRouter()


def _hmmlearn_available() -> bool:
    try:
        import hmmlearn  # noqa: F401
    except ImportError:
        return False
    return True


@router.get("/health", response_model=HealthResponse, tags=["system"])
def health() -> HealthResponse:
    """Liveness probe — process is up."""
    return HealthResponse(
        status="ok",
        version=settings.app_version,
        environment=settings.environment,
    )


@router.get("/ready", response_model=ReadinessResponse, tags=["system"])
def ready() -> ReadinessResponse:
    """Readiness probe — dependencies are usable."""
    backend = "redis" if settings.redis_url else "memory"
    return ReadinessResponse(
        status="ok" if _hmmlearn_available() else "degraded",
        hmmlearn=_hmmlearn_available(),
        cache_backend=backend,
        metrics=metrics_enabled(),
    )


def _map_domain_errors(exc: Exception) -> HTTPException:
    if isinstance(exc, InsufficientDataError):
        return HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        )
    if isinstance(exc, DataUnavailableError):
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        )
    if isinstance(exc, ModelFitError):
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Model fitting failed. Try a different ticker or fewer states.",
        )
    logger.exception("Unhandled error during request: %s", exc)
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Internal server error.",
    )


@router.post(
    "/analyze",
    response_model=AnalysisResponse,
    tags=["analysis"],
    dependencies=[Depends(require_api_key)],
)
def analyze(payload: AnalysisRequest) -> AnalysisResponse:
    """Fetch market data, fit an HMM, and return regimes + forecast."""
    try:
        return run_analysis(
            ticker=payload.ticker,
            period=payload.period,
            interval=payload.interval,
            n_states=payload.n_states,
            forecast_days=payload.forecast_days,
            auto_select_states=payload.auto_select_states,
            selection_criterion=payload.selection_criterion,
        )
    except (InsufficientDataError, DataUnavailableError, ModelFitError) as exc:
        raise _map_domain_errors(exc) from exc
    except Exception as exc:  # noqa: BLE001 - last-resort guard
        raise _map_domain_errors(exc) from exc


@router.get("/analyze", response_model=AnalysisResponse, tags=["analysis"])
def analyze_get(
    ticker: str = settings.default_ticker,
    period: str = settings.default_period,
    interval: str = settings.default_interval,
    n_states: int = settings.default_hidden_states,
    forecast_days: int = 5,
    auto_select_states: bool = False,
    selection_criterion: str = "bic",
) -> AnalysisResponse:
    """Convenience GET wrapper around ``/analyze`` for quick links and demos."""
    payload = AnalysisRequest(
        ticker=ticker,
        period=period,
        interval=interval,
        n_states=n_states,
        forecast_days=forecast_days,
        auto_select_states=auto_select_states,
        selection_criterion=selection_criterion,
    )
    return analyze(payload)


@router.post(
    "/backtest",
    response_model=BacktestResponse,
    tags=["analysis"],
    dependencies=[Depends(require_api_key)],
)
def backtest(payload: BacktestRequest) -> BacktestResponse:
    """Run a walk-forward backtest of the one-step forecast."""
    try:
        return run_backtest(
            ticker=payload.ticker,
            period=payload.period,
            interval=payload.interval,
            n_states=payload.n_states,
            stride=payload.stride,
            max_folds=payload.max_folds,
        )
    except (InsufficientDataError, DataUnavailableError, ModelFitError) as exc:
        raise _map_domain_errors(exc) from exc
    except Exception as exc:  # noqa: BLE001 - last-resort guard
        raise _map_domain_errors(exc) from exc


@router.post(
    "/cache/clear",
    tags=["system"],
    dependencies=[Depends(require_api_key)],
)
def clear_cache() -> dict[str, str]:
    """Flush the analysis cache (admin/maintenance)."""
    cache.clear()
    return {"status": "cleared"}
