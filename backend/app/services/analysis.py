"""High-level analysis orchestration.

Ties together market-data acquisition, HMM fitting, model selection,
forecasting and caching into a single response object the API layer can
serialize directly.
"""

from __future__ import annotations

import hashlib
import json

import pandas as pd

from app.core.cache import cache
from app.core.config import settings
from app.core.logging import get_logger
from app.core.metrics import observe_analysis
from app.schemas.stock import (
    AnalysisResponse,
    BacktestPointSchema,
    BacktestResponse,
    ForecastPoint,
    ModelCandidate,
    ModelDiagnostics,
    PricePoint,
    StateStats,
    TransitionMatrix,
)
from app.services import market_data
from app.services.backtest import walk_forward_backtest
from app.services.exceptions import DataUnavailableError
from app.services.hmm_engine import HMMResult, fit_hmm, forecast
from app.services.model_selection import select_n_states

logger = get_logger(__name__)


def _cache_key(prefix: str, **parts: object) -> str:
    raw = json.dumps(parts, sort_keys=True, default=str)
    digest = hashlib.sha256(raw.encode()).hexdigest()[:16]
    return f"{prefix}:{digest}"


def _load_data(
    ticker: str, period: str, interval: str, allow_synthetic: bool
) -> tuple[pd.DataFrame, str]:
    """Return (dataframe, source) where source is 'live' or 'synthetic'."""
    try:
        df = market_data.fetch_history(ticker, period=period, interval=interval)
        return df, "live"
    except DataUnavailableError as exc:
        if not allow_synthetic:
            raise
        logger.warning("Live data unavailable (%s); using synthetic series.", exc)
        return market_data.generate_synthetic_history(ticker=ticker), "synthetic"


def _build_response(
    *,
    ticker: str,
    period: str,
    interval: str,
    currency: str,
    result: HMMResult,
    work: pd.DataFrame,
    forecast_days: int,
    diagnostics: ModelDiagnostics,
) -> AnalysisResponse:
    forecast_points = forecast(work, result, days=forecast_days)

    max_points = 750
    work_out = work.iloc[-max_points:] if len(work) > max_points else work

    prices = [
        PricePoint(
            date=idx.date(),
            open=round(float(row["open"]), 4),
            high=round(float(row["high"]), 4),
            low=round(float(row["low"]), 4),
            close=round(float(row["close"]), 4),
            volume=float(row["volume"]),
            log_return=round(float(row["log_return"]), 6),
            state=int(row["state"]),
        )
        for idx, row in work_out.iterrows()
    ]

    states = [
        StateStats(
            state=s.state,
            label=s.label,
            count=s.count,
            mean_return=round(s.mean_return, 6),
            volatility=round(s.volatility, 6),
            frequency=round(s.frequency, 4),
        )
        for s in result.state_summaries
    ]

    transitions = TransitionMatrix(
        states=list(range(result.n_states)),
        matrix=[[round(float(v), 4) for v in row] for row in result.transition_matrix],
    )

    latest_state = int(work["state"].iloc[-1])
    as_of = work.index[-1]
    as_of_date = as_of.date() if isinstance(as_of, pd.Timestamp) else pd.Timestamp(as_of).date()

    return AnalysisResponse(
        ticker=ticker,
        period=period,
        interval=interval,
        n_states=result.n_states,
        currency=currency,
        as_of=as_of_date,
        latest_close=round(float(work["close"].iloc[-1]), 4),
        latest_state=latest_state,
        latest_state_label=result.label_map[latest_state],
        log_likelihood=round(result.log_likelihood, 4),
        diagnostics=diagnostics,
        cached=False,
        prices=prices,
        states=states,
        transitions=transitions,
        forecast=[
            ForecastPoint(
                step=int(p["step"]),
                predicted_close=p["predicted_close"],
                lower_bound=p["lower_bound"],
                upper_bound=p["upper_bound"],
            )
            for p in forecast_points
        ],
    )


def run_analysis(
    ticker: str,
    period: str,
    interval: str,
    n_states: int,
    forecast_days: int,
    auto_select_states: bool = False,
    selection_criterion: str = "bic",
    allow_synthetic_fallback: bool = True,
    use_cache: bool = True,
) -> AnalysisResponse:
    """Run the full fetch → (select) → fit → forecast pipeline.

    Results are cached by request parameters. If live data cannot be fetched and
    ``allow_synthetic_fallback`` is set, a deterministic synthetic series is used
    so the dashboard still renders (``currency`` becomes ``"DEMO"``).
    """
    key = _cache_key(
        "analyze",
        ticker=ticker,
        period=period,
        interval=interval,
        n_states=n_states,
        forecast_days=forecast_days,
        auto=auto_select_states,
        crit=selection_criterion,
    )

    if use_cache and settings.cache_enabled:
        hit = cache.get(key)
        if hit is not None:
            observe_analysis(source=hit.get("currency", "?"), cache="hit")
            cached = AnalysisResponse.model_validate(hit)
            cached.cached = True
            return cached

    df, source = _load_data(ticker, period, interval, allow_synthetic_fallback)
    currency = "DEMO" if source == "synthetic" else "USD"

    if auto_select_states:
        selection = select_n_states(df, criterion=selection_criterion)
        result, work = selection.result, selection.work
        diagnostics = ModelDiagnostics(
            log_likelihood=round(result.log_likelihood, 4),
            aic=round(result.aic, 2),
            bic=round(result.bic, 2),
            n_params=result.n_params,
            converged=result.converged,
            selected_by=selection.criterion,
            candidates=[
                ModelCandidate(
                    n_states=c.n_states,
                    log_likelihood=c.log_likelihood,
                    aic=c.aic,
                    bic=c.bic,
                    converged=c.converged,
                )
                for c in selection.candidates
            ],
        )
    else:
        result, work = fit_hmm(df, n_states=n_states)
        diagnostics = ModelDiagnostics(
            log_likelihood=round(result.log_likelihood, 4),
            aic=round(result.aic, 2),
            bic=round(result.bic, 2),
            n_params=result.n_params,
            converged=result.converged,
            selected_by=None,
            candidates=[],
        )

    response = _build_response(
        ticker=ticker,
        period=period,
        interval=interval,
        currency=currency,
        result=result,
        work=work,
        forecast_days=forecast_days,
        diagnostics=diagnostics,
    )

    observe_analysis(source=currency, cache="miss")
    if use_cache and settings.cache_enabled:
        cache.set(key, response.model_dump(mode="json"))
    return response


def run_backtest(
    ticker: str,
    period: str,
    interval: str,
    n_states: int,
    stride: int,
    max_folds: int,
    allow_synthetic_fallback: bool = True,
    use_cache: bool = True,
) -> BacktestResponse:
    """Run a walk-forward backtest and build the API response."""
    key = _cache_key(
        "backtest",
        ticker=ticker,
        period=period,
        interval=interval,
        n_states=n_states,
        stride=stride,
        max_folds=max_folds,
    )
    if use_cache and settings.cache_enabled:
        hit = cache.get(key)
        if hit is not None:
            return BacktestResponse.model_validate(hit)

    df, _ = _load_data(ticker, period, interval, allow_synthetic_fallback)
    bt = walk_forward_backtest(
        df, n_states=n_states, stride=stride, max_folds=max_folds
    )

    response = BacktestResponse(
        ticker=ticker,
        n_states=n_states,
        folds=bt.folds,
        directional_accuracy=bt.directional_accuracy,
        baseline_accuracy=bt.baseline_accuracy,
        rmse=bt.rmse,
        mape=bt.mape,
        points=[
            BacktestPointSchema(
                date=p.date,
                actual_close=p.actual_close,
                predicted_close=p.predicted_close,
                correct_direction=p.correct_direction,
            )
            for p in bt.points
        ],
    )
    if use_cache and settings.cache_enabled:
        cache.set(key, response.model_dump(mode="json"))
    return response
