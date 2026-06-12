"""Market-data acquisition layer.

Wraps ``yfinance`` behind a small, testable interface. When live data is
unavailable (offline CI, rate limits, or an unknown ticker) the caller can fall
back to a deterministic synthetic series so the API and demos stay functional.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from app.core.logging import get_logger
from app.services.exceptions import DataUnavailableError

logger = get_logger(__name__)

# Minimum observations required to fit a meaningful multi-state HMM.
MIN_OBSERVATIONS = 60


def fetch_history(
    ticker: str,
    period: str = "2y",
    interval: str = "1d",
) -> pd.DataFrame:
    """Fetch OHLCV history for ``ticker`` as a clean, indexed DataFrame.

    Raises:
        DataUnavailableError: if no rows are returned.
    """
    try:
        import yfinance as yf
    except ImportError as exc:  # pragma: no cover - dependency guard
        raise DataUnavailableError("yfinance is not installed") from exc

    logger.info("Fetching %s history period=%s interval=%s", ticker, period, interval)
    try:
        df = yf.download(
            tickers=ticker,
            period=period,
            interval=interval,
            auto_adjust=True,
            progress=False,
            threads=False,
        )
    except Exception as exc:  # noqa: BLE001 - normalize any provider error
        raise DataUnavailableError(f"Failed to download {ticker}: {exc}") from exc

    if df is None or df.empty:
        raise DataUnavailableError(f"No market data found for '{ticker}'.")

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
