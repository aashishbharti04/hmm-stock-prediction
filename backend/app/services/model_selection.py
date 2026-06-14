"""Objective regime-count selection via information criteria.

Fitting an HMM requires choosing the number of hidden states ``K``. Rather than
guessing, we fit candidates across a range and pick the one minimising the
**Bayesian Information Criterion** (BIC) — which penalises model complexity and
guards against over-fitting short price series. AIC is reported alongside.
"""

from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from app.core.config import settings
from app.core.logging import get_logger
from app.services.exceptions import ModelFitError
from app.services.hmm_engine import HMMResult, fit_hmm

logger = get_logger(__name__)


@dataclass
class Candidate:
    n_states: int
    log_likelihood: float
    aic: float
    bic: float
    converged: bool


@dataclass
class SelectionResult:
    selected_states: int
    criterion: str
    candidates: list[Candidate]
    result: HMMResult
    work: pd.DataFrame


def select_n_states(
    df: pd.DataFrame,
    min_states: int | None = None,
    max_states: int | None = None,
    criterion: str = "bic",
) -> SelectionResult:
    """Fit HMMs across a range of K and select the best by BIC (or AIC).

    Returns the winning fit (so callers don't refit) plus every candidate's
    scores for transparency in the UI.
    """
    lo = min_states or settings.model_selection_min_states
    hi = max_states or settings.model_selection_max_states
    if lo < 2:
        lo = 2
    if hi < lo:
        hi = lo
    criterion = criterion.lower()
    if criterion not in {"bic", "aic"}:
        raise ValueError("criterion must be 'bic' or 'aic'")

    candidates: list[Candidate] = []
    best: tuple[float, HMMResult, pd.DataFrame] | None = None

    for k in range(lo, hi + 1):
        try:
            result, work = fit_hmm(df, n_states=k)
        except ModelFitError as exc:
            logger.warning("Candidate K=%d failed to fit: %s", k, exc)
            continue
        score = result.bic if criterion == "bic" else result.aic
        candidates.append(
            Candidate(
                n_states=k,
                log_likelihood=round(result.log_likelihood, 4),
                aic=round(result.aic, 2),
                bic=round(result.bic, 2),
                converged=result.converged,
            )
        )
        if best is None or score < best[0]:
            best = (score, result, work)

    if best is None:
        raise ModelFitError("No HMM candidate could be fitted.")

    selected = best[1].n_states
    logger.info(
        "Model selection (%s): chose K=%d from %d candidates",
        criterion,
        selected,
        len(candidates),
    )
    return SelectionResult(
        selected_states=selected,
        criterion=criterion,
        candidates=candidates,
        result=best[1],
        work=best[2],
    )
