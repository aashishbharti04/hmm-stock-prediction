"""Tests for the walk-forward backtester."""

from __future__ import annotations

import pytest

from app.services.backtest import walk_forward_backtest
from app.services.exceptions import InsufficientDataError
from app.services.market_data import generate_synthetic_history


def test_backtest_metrics_in_range() -> None:
    df = generate_synthetic_history(seed=9, n=300)
    # Keep folds small/fast for CI: coarse stride, few folds, single restart.
    bt = walk_forward_backtest(
        df, n_states=2, stride=40, max_folds=4, restarts=1
    )

    assert bt.folds > 0
    assert 0.0 <= bt.directional_accuracy <= 1.0
    assert 0.0 <= bt.baseline_accuracy <= 1.0
    assert bt.rmse >= 0.0
    assert bt.mape >= 0.0
    assert len(bt.points) == bt.folds


def test_backtest_requires_enough_data() -> None:
    df = generate_synthetic_history(n=70)
    with pytest.raises(InsufficientDataError):
        walk_forward_backtest(df, n_states=2, min_train=65, stride=10)
