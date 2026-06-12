"""High-level analysis orchestration.

Ties together market-data acquisition, HMM fitting, and forecasting into a
single response object the API layer can serialize directly.
"""

from __future__ import annotations

import pandas as pd

from app.core.logging import get_logger
from app.schemas.stock import (
    AnalysisResponse,
    ForecastPoint,
    PricePoint,
    StateStats,
    TransitionMatrix,
)
from app.services import market_data
from app.services.exceptions import DataUnavailableError
from app.services.hmm_engine import fit_hmm, forecast

logger = get_logger(__name__)


def run_analysis(
    ticker: str,
    period: str,
    interval: str,
    n_states: int,
    forecast_days: int,
    allow_synthetic_fallback: bool = True,
) -> AnalysisResponse:
    """Run the full fetch → fit → forecast pipeline and build the response.

    If live data cannot be fetched and ``allow_synthetic_fallback`` is set, a
    deterministic synthetic series is used so the dashboard still renders. The
    ``currency`` field signals "DEMO" in that case for UI transparency.
    """
    currency = "USD"
    try:
        df = market_data.fetch_history(ticker, period=period, interval=interval)
    except DataUnavailableError as exc:
        if not allow_synthetic_fallback:
            raise
        logger.warning("Live data unavailable (%s); using synthetic series.", exc)
        df = market_data.generate_synthetic_history(ticker=ticker)
        currency = "DEMO"

    result, work = fit_hmm(df, n_states=n_states)
    forecast_points = forecast(work, result, days=forecast_days)

    # --- Build price points (downsample for payload size if very long) -----
    max_points = 750
    if len(work) > max_points:
        work_out = work.iloc[-max_points:]
    else:
        work_out = work

    prices: list[PricePoint] = [
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

    states: list[StateStats] = [
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
    if isinstance(as_of, pd.Timestamp):
        as_of_date = as_of.date()
    else:  # pragma: no cover - defensive
        as_of_date = pd.Timestamp(as_of).date()

    return AnalysisResponse(
        ticker=ticker,
        period=period,
        interval=interval,
        n_states=n_states,
        currency=currency,
        as_of=as_of_date,
        latest_close=round(float(work["close"].iloc[-1]), 4),
        latest_state=latest_state,
        latest_state_label=result.label_map[latest_state],
        log_likelihood=round(result.log_likelihood, 4),
        prices=prices,
        states=states,
        transitions=transitions,
        forecast=[ForecastPoint(**p) for p in forecast_points],
    )
