"""Validation tests for request schemas."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.schemas.stock import AnalysisRequest


def test_ticker_is_normalized_to_upper() -> None:
    req = AnalysisRequest(ticker="aapl")
    assert req.ticker == "AAPL"


def test_invalid_ticker_rejected() -> None:
    with pytest.raises(ValidationError):
        AnalysisRequest(ticker="not a ticker!")


def test_state_bounds_enforced() -> None:
    with pytest.raises(ValidationError):
        AnalysisRequest(ticker="AAPL", n_states=99)


def test_forecast_horizon_bounds_enforced() -> None:
    with pytest.raises(ValidationError):
        AnalysisRequest(ticker="AAPL", forecast_days=999)


def test_invalid_period_rejected() -> None:
    with pytest.raises(ValidationError):
        AnalysisRequest(ticker="AAPL", period="100y")
