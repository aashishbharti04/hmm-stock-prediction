"""Hidden Markov Model engine for market-regime detection and forecasting.

Pipeline
--------
1.  Compute daily log-returns from close prices (the model's observation).
2.  Fit a Gaussian HMM (Baum-Welch / EM) over the returns.
3.  Decode the most-likely hidden-state sequence (Viterbi).
4.  Label states as Bullish / Bearish / Neutral by mean return.
5.  Estimate per-state statistics and the transition matrix.
6.  Forecast future closes by propagating the state distribution forward and
    sampling expected returns, with a volatility-based uncertainty band.

The engine is deliberately framework-agnostic: it takes a DataFrame and returns
plain dataclasses/dicts so it can be unit-tested without FastAPI.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from app.core.config import settings
from app.core.logging import get_logger
from app.services.exceptions import InsufficientDataError, ModelFitError
from app.services.market_data import MIN_OBSERVATIONS

logger = get_logger(__name__)


@dataclass
class StateSummary:
    state: int
    label: str
    count: int
    mean_return: float
    volatility: float
    frequency: float


@dataclass
class HMMResult:
    n_states: int
    log_likelihood: float
    states_sequence: np.ndarray  # shape (T,)
    state_summaries: list[StateSummary]
    transition_matrix: np.ndarray  # shape (n_states, n_states)
    label_map: dict[int, str]


def _label_states(means: np.ndarray) -> dict[int, str]:
    """Map raw state ids to human labels by ranking mean returns.

    The state with the highest mean return is "Bullish", the lowest is
    "Bearish", and any in between are "Neutral" (numbered if more than one).
    """
    order = np.argsort(means)  # ascending
    labels: dict[int, str] = {}
    n = len(means)
    for rank, state in enumerate(order):
        if rank == 0:
            labels[int(state)] = "Bearish"
        elif rank == n - 1:
            labels[int(state)] = "Bullish"
        else:
            labels[int(state)] = "Neutral" if n == 3 else f"Neutral {rank}"
    return labels


def fit_hmm(
    df: pd.DataFrame,
    n_states: int = 3,
    n_iter: int | None = None,
    random_state: int | None = None,
) -> tuple[HMMResult, pd.DataFrame]:
    """Fit a Gaussian HMM on log-returns and decode hidden states.

    Returns the fitted result plus the input DataFrame augmented with
    ``log_return`` and ``state`` columns (first row dropped — no return).
    """
    if len(df) < MIN_OBSERVATIONS:
        raise InsufficientDataError(
            f"Need at least {MIN_OBSERVATIONS} observations, got {len(df)}."
        )

    try:
        from hmmlearn.hmm import GaussianHMM
    except ImportError as exc:  # pragma: no cover - dependency guard
        raise ModelFitError("hmmlearn is not installed") from exc

    work = df.copy()
    work["log_return"] = np.log(work["close"]).diff()
    work = work.dropna(subset=["log_return"])

    observations = work["log_return"].to_numpy().reshape(-1, 1)

    model = GaussianHMM(
        n_components=n_states,
        covariance_type="diag",
        n_iter=n_iter or settings.hmm_n_iter,
        random_state=random_state or settings.hmm_random_state,
    )

    try:
        model.fit(observations)
        hidden_states = model.predict(observations)
        log_likelihood = float(model.score(observations))
    except Exception as exc:  # noqa: BLE001 - convergence/linalg failures
        raise ModelFitError(f"HMM failed to fit: {exc}") from exc

    work["state"] = hidden_states

    means = model.means_.flatten()
    label_map = _label_states(means)

    summaries: list[StateSummary] = []
    total = len(work)
    for s in range(n_states):
        mask = hidden_states == s
        rets = work.loc[mask, "log_return"]
        summaries.append(
            StateSummary(
                state=s,
                label=label_map[s],
                count=int(mask.sum()),
                mean_return=float(rets.mean()) if len(rets) else 0.0,
                volatility=float(rets.std()) if len(rets) else 0.0,
                frequency=float(mask.sum() / total) if total else 0.0,
            )
        )

    result = HMMResult(
        n_states=n_states,
        log_likelihood=log_likelihood,
        states_sequence=hidden_states,
        state_summaries=summaries,
        transition_matrix=np.asarray(model.transmat_, dtype=float),
        label_map=label_map,
    )
    logger.info(
        "Fitted %d-state HMM: logL=%.2f labels=%s",
        n_states,
        log_likelihood,
        label_map,
    )
    return result, work


def forecast(
    work: pd.DataFrame,
    result: HMMResult,
    days: int = 5,
) -> list[dict[str, float]]:
    """Forecast future closes by propagating the hidden-state distribution.

    For each future step we advance the state distribution one transition,
    compute the expectation of next-day return as a state-probability-weighted
    average of per-state mean returns, and widen an uncertainty band using the
    blended volatility scaled by sqrt(horizon).
    """
    means = np.array([s.mean_return for s in result.state_summaries])
    vols = np.array([s.volatility for s in result.state_summaries])
    trans = result.transition_matrix

    # Start from the last decoded state as a one-hot distribution.
    last_state = int(result.states_sequence[-1])
    dist = np.zeros(result.n_states)
    dist[last_state] = 1.0

    last_close = float(work["close"].iloc[-1])
    points: list[dict[str, float]] = []
    cumulative_close = last_close

    for step in range(1, days + 1):
        dist = dist @ trans  # propagate one day forward
        exp_return = float(dist @ means)
        blended_vol = float(np.sqrt(dist @ (vols**2)))
        cumulative_close *= float(np.exp(exp_return))
        band = cumulative_close * blended_vol * np.sqrt(step)
        points.append(
            {
                "step": step,
                "predicted_close": round(cumulative_close, 4),
                "lower_bound": round(cumulative_close - 1.96 * band, 4),
                "upper_bound": round(cumulative_close + 1.96 * band, 4),
            }
        )
    return points
