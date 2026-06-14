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
_ALLOWED_CRITERIA = {"bic", "aic"}


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
    auto_select_states: bool = Field(
        False,
        description="If true, choose n_states automatically via BIC/AIC.",
    )
    selection_criterion: str = Field(
        "bic", description="Information criterion for auto-selection (bic|aic)."
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

    @field_validator("selection_criterion")
    @classmethod
    def _check_criterion(cls, v: str) -> str:
        v = v.lower()
        if v not in _ALLOWED_CRITERIA:
            raise ValueError(f"selection_criterion must be one of {_ALLOWED_CRITERIA}")
        return v


class BacktestRequest(AnalysisRequest):
    """Parameters for a walk-forward backtest run."""

    stride: int = Field(5, ge=1, le=20, description="Days between backtest folds.")
    max_folds: int = Field(
        40, ge=5, le=120, description="Upper bound on number of folds."
    )


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


class ModelCandidate(BaseModel):
    """Scores for one candidate regime count during model selection."""

    n_states: int
    log_likelihood: float
    aic: float
    bic: float
    converged: bool


class ModelDiagnostics(BaseModel):
    """Goodness-of-fit diagnostics for the chosen model."""

    log_likelihood: float
    aic: float
    bic: float
    n_params: int
    converged: bool
    selected_by: str | None = None  # "bic" | "aic" | None (user-specified)
    candidates: list[ModelCandidate] = Field(default_factory=list)


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
    diagnostics: ModelDiagnostics
    cached: bool = False
    prices: list[PricePoint]
    states: list[StateStats]
    transitions: TransitionMatrix
    forecast: list[ForecastPoint]


class BacktestPointSchema(BaseModel):
    date: str
    actual_close: float
    predicted_close: float
    correct_direction: bool


class BacktestResponse(BaseModel):
    """Out-of-sample walk-forward backtest results."""

    ticker: str
    n_states: int
    folds: int
    directional_accuracy: float
    baseline_accuracy: float
    rmse: float
    mape: float
    points: list[BacktestPointSchema]


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str


class ReadinessResponse(BaseModel):
    status: str
    hmmlearn: bool
    cache_backend: str
    metrics: bool
