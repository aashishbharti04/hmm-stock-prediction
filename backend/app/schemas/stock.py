"""Pydantic schemas for request validation and response serialization.

These schemas form the validated boundary between untrusted client input and
the modeling core. Every field is constrained to prevent abuse (e.g. absurd
state counts, oversized forecast horizons, or injection via ticker strings).
"""

from __future__ import annotations

import re
from datetime import date

from pydantic import BaseModel, Field, field_validator

# Tickers are uppercase letters, digits, dots and dashes (e.g. BRK.B, RDS-A).
_TICKER_RE = re.compile(r"^[A-Z0-9.\-]{1,12}$")

_ALLOWED_PERIODS = {
    "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "max",
}
_ALLOWED_INTERVALS = {"1d", "1wk", "1mo"}


class AnalysisRequest(BaseModel):
    """Parameters controlling a stock fetch + HMM analysis run."""

    ticker: str = Field(..., examples=["AAPL"], description="Stock ticker symbol.")
    period: str = Field("2y", description="Look-back window of historical data.")
    interval: str = Field("1d", description="Sampling interval.")
    n_states: int = Field(
        3, ge=2, le=8, description="Number of hidden market regimes to model."
    )
    forecast_days: int = Field(
        5, ge=1, le=30, description="Number of future steps to forecast."
    )

    @field_validator("ticker")
    @classmethod
    def _normalize_ticker(cls, v: str) -> str:
        v = v.strip().upper()
        if not _TICKER_RE.match(v):
            raise ValueError(
                "Ticker must be 1–12 chars: letters, digits, '.', '-' only."
            )
        return v

    @field_validator("period")
    @classmethod
    def _check_period(cls, v: str) -> str:
        if v not in _ALLOWED_PERIODS:
            raise ValueError(f"period must be one of {sorted(_ALLOWED_PERIODS)}")
        return v

    @field_validator("interval")
    @classmethod
    def _check_interval(cls, v: str) -> str:
        if v not in _ALLOWED_INTERVALS:
            raise ValueError(f"interval must be one of {sorted(_ALLOWED_INTERVALS)}")
        return v


class PricePoint(BaseModel):
    """A single OHLC price observation with its inferred hidden state."""

    date: date
    open: float
    high: float
    low: float
    close: float
    volume: float
    log_return: float
    state: int


class StateStats(BaseModel):
    """Descriptive statistics for one inferred hidden state (regime)."""

    state: int
    label: str
    count: int
    mean_return: float
    volatility: float
    frequency: float


class ForecastPoint(BaseModel):
    """A single forecasted future close price with uncertainty band."""

    step: int
    predicted_close: float
    lower_bound: float
    upper_bound: float


class TransitionMatrix(BaseModel):
    """Estimated state-to-state transition probabilities."""

    states: list[int]
    matrix: list[list[float]]


class AnalysisResponse(BaseModel):
    """Full payload returned to the dashboard."""

    ticker: str
    period: str
    interval: str
    n_states: int
    currency: str
    as_of: date
    latest_close: float
    latest_state: int
    latest_state_label: str
    log_likelihood: float
    prices: list[PricePoint]
    states: list[StateStats]
    transitions: TransitionMatrix
    forecast: list[ForecastPoint]


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
