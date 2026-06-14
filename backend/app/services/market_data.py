"""Market-data acquisition layer.

Wraps ``yfinance`` behind a small, testable interface with production-grade
resilience:

* **Retries with exponential backoff** smooth over transient provider hiccups.
* **A circuit breaker** stops hammering a provider that is consistently failing
  (rate-limited / down), failing fast for a cooldown instead.

When live data is unavailable the caller can fall back to a deterministic
synthetic series so the API and demos stay functional.
"""

from __future__ import annotations

import threading
import time

import numpy as np
import pandas as pd

from app.core.config import settings
from app.core.logging import get_logger
from app.services.exceptions import DataUnavailableError

logger = get_logger(__name__)

# Minimum observations required to fit a meaningful multi-state HMM.
MIN_OBSERVATIONS = 60


class CircuitBreaker:
    """Trip after N consecutive failures; fail fast during a cooldown window."""

    def __init__(self, threshold: int, cooldown_seconds: float) -> None:
        self._threshold = threshold
        self._cooldown = cooldown_seconds
        self._failures = 0
        self._opened_at: float | None = None
        self._lock = threading.Lock()

    @property
    def is_open(self) -> bool:
        with self._lock:
            if self._opened_at is None:
                return False
            if time.monotonic() - self._opened_at >= self._cooldown:
                # Cooldown elapsed — half-open: allow a probe request through.
                self._opened_at = None
                self._failures = 0
                return False
            return True

    def record_success(self) -> None:
        with self._lock:
            self._failures = 0
            self._opened_at = None

    def record_failure(self) -> None:
        with self._lock:
            self._failures += 1
            if self._failures >= self._threshold and self._opened_at is None:
                self._opened_at = time.monotonic()
                logger.warning(
                    "Market-data circuit breaker OPEN after %d failures",
                    self._failures,
                )


_breaker = CircuitBreaker(
    threshold=settings.circuit_breaker_threshold,
    cooldown_seconds=settings.circuit_breaker_cooldown_seconds,
)


def _download(ticker: str, period: str, interval: str) -> pd.DataFrame:
    """Single yfinance download attempt; raises on any failure or empty frame."""
    try:
        import yfinance as yf
    except ImportError as exc:  # pragma: no cover - dependency guard
        raise DataUnavailableError("yfinance is not installed") from exc

    df = yf.download(
        tickers=ticker,
        period=period,
        interval=interval,
        auto_adjust=True,
        progress=False,
        threads=False,
    )
    if df is None or df.empty:
        raise DataUnavailableError(f"No market data found for '{ticker}'.")
    return df


def fetch_history(
    ticker: str,
    period: str = "2y",
    interval: str = "1d",
) -> pd.DataFrame:
    """Fetch OHLCV history for ``ticker`` as a clean, indexed DataFrame.

    Retries transient failures with exponential backoff and respects a circuit
    breaker so a persistently-failing provider is not hammered.

    Raises:
        DataUnavailableError: if data cannot be retrieved after retries, or the
            circuit breaker is open.
    """
    if _breaker.is_open:
        raise DataUnavailableError(
            "Market-data provider temporarily unavailable (circuit open)."
        )

    logger.info(
        "Fetching %s history period=%s interval=%s", ticker, period, interval
    )

    last_exc: Exception | None = None
    for attempt in range(1, settings.data_fetch_retries + 1):
        try:
            df = _download(ticker, period, interval)
            _breaker.record_success()
            break
        except DataUnavailableError as exc:
            # An empty frame for a valid request is not a provider fault: don't
            # trip the breaker or retry an unknown ticker forever.
            raise exc
        except Exception as exc:  # noqa: BLE001 - normalize any provider error
            last_exc = exc
            logger.warning(
                "Fetch attempt %d/%d for %s failed: %s",
                attempt,
                settings.data_fetch_retries,
                ticker,
                exc,
            )
            if attempt < settings.data_fetch_retries:
                time.sleep(settings.data_fetch_backoff_seconds * (2 ** (attempt - 1)))
    else:
        _breaker.record_failure()
        raise DataUnavailableError(
            f"Failed to download {ticker} after "
            f"{settings.data_fetch_retries} attempts: {last_exc}"
        ) from last_exc

    # yfinance may return a MultiIndex for single tickers; flatten it.
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    df = df.rename(columns=str.lower)
    keep = ["open", "high", "low", "close", "volume"]
    df = df[[c for c in keep if c in df.columns]].dropna()
    df.index = pd.to_datetime(df.index)
    return df


def generate_synthetic_history(
    ticker: str = "DEMO",
    n: int = 504,
    seed: int = 42,
) -> pd.DataFrame:
    """Generate a deterministic synthetic OHLCV series with regime switching.

    Useful for offline development, CI, and demo screenshots. The series is
    built from a hidden 3-regime process so the HMM has real structure to find.
    """
    rng = np.random.default_rng(seed)
    regimes = np.array([0.0008, -0.0012, 0.0001])  # bull / bear / sideways drift
    vols = np.array([0.010, 0.022, 0.006])
    trans = np.array(
        [[0.94, 0.03, 0.03], [0.05, 0.90, 0.05], [0.04, 0.04, 0.92]]
    )

    state = 0
    log_returns = np.empty(n)
    for t in range(n):
        state = rng.choice(3, p=trans[state])
        log_returns[t] = rng.normal(regimes[state], vols[state])

    close = 150.0 * np.exp(np.cumsum(log_returns))
    dates = pd.bdate_range(end=pd.Timestamp("2025-01-01"), periods=n)
    high = close * (1 + np.abs(rng.normal(0, 0.004, n)))
    low = close * (1 - np.abs(rng.normal(0, 0.004, n)))
    open_ = np.concatenate([[close[0]], close[:-1]])
    volume = rng.integers(5_000_000, 50_000_000, n).astype(float)

    return pd.DataFrame(
        {
            "open": open_,
            "high": high,
            "low": low,
            "close": close,
            "volume": volume,
        },
        index=dates,
    )
