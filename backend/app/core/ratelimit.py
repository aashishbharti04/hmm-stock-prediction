"""A lightweight, dependency-free fixed-window rate limiter.

Keyed by client identity (API key if present, else client IP). Suitable for a
single-replica deployment; for multi-replica use a shared store (e.g. Redis)
behind the same interface. Kept intentionally simple and allocation-light.
"""

from __future__ import annotations

import threading
import time

from app.core.config import settings


class RateLimiter:
    """Fixed-window counter rate limiter."""

    def __init__(self, limit: int, window_seconds: int) -> None:
        self._limit = limit
        self._window = window_seconds
        self._lock = threading.Lock()
        # key -> (window_start_monotonic, count)
        self._buckets: dict[str, tuple[float, int]] = {}

    def check(self, key: str) -> tuple[bool, int, int]:
        """Return (allowed, remaining, retry_after_seconds)."""
        now = time.monotonic()
        with self._lock:
            window_start, count = self._buckets.get(key, (now, 0))
            elapsed = now - window_start
            if elapsed >= self._window:
                # New window.
                window_start, count = now, 0
                elapsed = 0.0

            if count >= self._limit:
                retry_after = int(self._window - elapsed) + 1
                self._buckets[key] = (window_start, count)
                return False, 0, retry_after

            count += 1
            self._buckets[key] = (window_start, count)
            return True, self._limit - count, 0

    def reset(self) -> None:
        with self._lock:
            self._buckets.clear()


limiter = RateLimiter(
    limit=settings.rate_limit_requests,
    window_seconds=settings.rate_limit_window_seconds,
)
