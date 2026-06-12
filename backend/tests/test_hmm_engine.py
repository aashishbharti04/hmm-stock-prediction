"""Tests for the HMM engine using deterministic synthetic data."""

from __future__ import annotations

import pytest

from app.services.exceptions import InsufficientDataError
from app.services.hmm_engine import fit_hmm, forecast
from app.services.market_data import generate_synthetic_history


def test_fit_hmm_decodes_states() -> None:
    df = generate_synthetic_history(seed=7)
    result, work = fit_hmm(df, n_states=3)

    assert result.n_states == 3
    assert len(result.state_summaries) == 3
    assert set(result.label_map.values()) >= {"Bullish", "Bearish"}
    # Transition matrix rows are valid probability distributions.
    for row in result.transition_matrix:
        assert pytest.approx(sum(row), abs=1e-6) == 1.0
    assert "state" in work.columns


def test_forecast_shape_and_bounds() -> None:
    df = generate_synthetic_history(seed=11)
    result, work = fit_hmm(df, n_states=3)
    points = forecast(work, result, days=5)

    assert len(points) == 5
    for p in points:
        assert p["lower_bound"] <= p["predicted_close"] <= p["upper_bound"]


def test_insufficient_data_raises() -> None:
    df = generate_synthetic_history(n=10)
    with pytest.raises(InsufficientDataError):
        fit_hmm(df, n_states=3)
