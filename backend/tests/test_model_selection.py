"""Tests for BIC/AIC model selection."""

from __future__ import annotations

from app.services.market_data import generate_synthetic_history
from app.services.model_selection import select_n_states


def test_select_returns_valid_choice() -> None:
    df = generate_synthetic_history(seed=3)
    sel = select_n_states(df, min_states=2, max_states=4, criterion="bic")

    assert 2 <= sel.selected_states <= 4
    assert sel.criterion == "bic"
    assert len(sel.candidates) >= 1
    # The selected model must have the minimum BIC among candidates.
    best_bic = min(c.bic for c in sel.candidates)
    chosen = next(c for c in sel.candidates if c.n_states == sel.selected_states)
    assert chosen.bic == best_bic
    # The winning fit is returned so callers don't refit.
    assert sel.result.n_states == sel.selected_states
    assert "state" in sel.work.columns


def test_select_supports_aic() -> None:
    df = generate_synthetic_history(seed=5)
    sel = select_n_states(df, min_states=2, max_states=3, criterion="aic")
    assert sel.criterion == "aic"
    best_aic = min(c.aic for c in sel.candidates)
    chosen = next(c for c in sel.candidates if c.n_states == sel.selected_states)
    assert chosen.aic == best_aic
