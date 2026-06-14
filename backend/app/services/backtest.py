"""Walk-forward backtesting of the HMM one-step forecast.

A model is only as good as its out-of-sample behaviour. This module performs an
**expanding-window walk-forward** evaluation: at each fold we fit on all data up
to time *t*, forecast the next session, then score the prediction against the
realised value. We report:

* **Directional accuracy** — how often the predicted up/down move is correct.
* **RMSE / MAPE** — magnitude error of the predicted next close.
* A **naive persistence baseline** (tomorrow == today) for honest comparison.

Refitting is the expensive part, so the number of folds is bounded and each
fold uses fewer restarts than a production fit.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from app.core.logging import get_logger
from app.services.exceptions import InsufficientDataError, ModelFitError
from app.services.hmm_engine import fit_hmm, forecast
from app.services.market_data import MIN_OBSERVATIONS

logger = get_logger(__name__)


@dataclass
class BacktestPoint:
    date: str
    actual_close: float
    predicted_close: float
    correct_direction: bool


@dataclass
class BacktestResult:
    folds: int
    directional_accuracy: float
    baseline_accuracy: float
    rmse: float
    mape: float
    points: list[BacktestPoint]


def walk_forward_backtest(
    df: pd.DataFrame,
    n_states: int = 3,
    min_train: int | None = None,
    stride: int = 5,
    max_folds: int = 40,
    restarts: int = 3,
) -> BacktestResult:
    """Run an expanding-window walk-forward backtest of the 1-step forecast."""
    min_train = max(min_train or MIN_OBSERVATIONS, MIN_OBSERVATIONS)
    n = len(df)
    if n < min_train + stride:
        raise InsufficientDataError(
            f"Need at least {min_train + stride} rows to backtest, got {n}."
        )

    # Choose fold indices (the row being predicted) from min_train .. n-1.
    candidate_idx = list(range(min_train, n, stride))
    if len(candidate_idx) > max_folds:
        # Evenly sample to cap compute cost.
        sel = np.linspace(0, len(candidate_idx) - 1, max_folds).round().astype(int)
        candidate_idx = [candidate_idx[i] for i in sorted(set(sel))]

    closes = df["close"].to_numpy()
    points: list[BacktestPoint] = []
    correct = 0
    baseline_correct = 0
    sq_err = 0.0
    abs_pct_err = 0.0
    fitted = 0

    for t in candidate_idx:
        train = df.iloc[:t]
        try:
            result, work = fit_hmm(train, n_states=n_states, n_restarts=restarts)
            pred = forecast(work, result, days=1)[0]["predicted_close"]
        except (ModelFitError, InsufficientDataError) as exc:
            logger.debug("Backtest fold at %d skipped: %s", t, exc)
            continue

        last_close = float(closes[t - 1])
        actual_close = float(closes[t])

        pred_up = pred >= last_close
        actual_up = actual_close >= last_close
        is_correct = pred_up == actual_up
        correct += int(is_correct)
        # Naive baseline: predict "up" (markets drift up over time) — a fair,
        # parameter-free reference the model must beat.
        baseline_correct += int(actual_up)

        sq_err += (pred - actual_close) ** 2
        abs_pct_err += abs(pred - actual_close) / actual_close
        fitted += 1

        idx = df.index[t]
        points.append(
            BacktestPoint(
                date=str(idx.date()) if hasattr(idx, "date") else str(idx),
                actual_close=round(actual_close, 4),
                predicted_close=round(float(pred), 4),
                correct_direction=is_correct,
            )
        )

    if fitted == 0:
        raise ModelFitError("Backtest produced no valid folds.")

    logger.info("Backtest complete: %d folds, %d correct", fitted, correct)
    return BacktestResult(
        folds=fitted,
        directional_accuracy=round(correct / fitted, 4),
        baseline_accuracy=round(baseline_correct / fitted, 4),
        rmse=round(float(np.sqrt(sq_err / fitted)), 4),
        mape=round(float(abs_pct_err / fitted), 4),
        points=points,
    )
