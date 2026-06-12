"""Domain-specific exceptions for clean API error mapping."""

from __future__ import annotations


class DataUnavailableError(Exception):
    """Raised when market data cannot be retrieved for a ticker."""


class InsufficientDataError(Exception):
    """Raised when there are too few observations to fit a model."""


class ModelFitError(Exception):
    """Raised when the HMM fails to converge or fit."""
