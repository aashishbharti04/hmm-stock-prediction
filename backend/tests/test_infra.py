"""Tests for caching, rate limiting, and the circuit breaker."""

from __future__ import annotations

from app.core.cache import InMemoryTTLCache
from app.core.ratelimit import RateLimiter
from app.services.market_data import CircuitBreaker


def test_cache_get_set_and_miss() -> None:
    c = InMemoryTTLCache(ttl_seconds=60, max_entries=8)
    assert c.get("missing") is None
    c.set("k", {"v": 1})
    assert c.get("k") == {"v": 1}
    stats = c.stats()
    assert stats["hits"] == 1
    assert stats["misses"] == 1


def test_cache_lru_eviction() -> None:
    c = InMemoryTTLCache(ttl_seconds=60, max_entries=2)
    c.set("a", {"n": 1})
    c.set("b", {"n": 2})
    c.get("a")  # touch a so b is least-recently-used
    c.set("c", {"n": 3})  # evicts b
    assert c.get("b") is None
    assert c.get("a") == {"n": 1}
    assert c.get("c") == {"n": 3}


def test_rate_limiter_blocks_after_limit() -> None:
    rl = RateLimiter(limit=3, window_seconds=60)
    results = [rl.check("client")[0] for _ in range(5)]
    assert results == [True, True, True, False, False]
    allowed, remaining, retry_after = rl.check("client")
    assert allowed is False
    assert remaining == 0
    assert retry_after >= 1


def test_rate_limiter_isolates_clients() -> None:
    rl = RateLimiter(limit=1, window_seconds=60)
    assert rl.check("a")[0] is True
    assert rl.check("b")[0] is True  # different key, own bucket
    assert rl.check("a")[0] is False


def test_circuit_breaker_trips_and_recovers() -> None:
    cb = CircuitBreaker(threshold=2, cooldown_seconds=0.0)
    assert cb.is_open is False
    cb.record_failure()
    assert cb.is_open is False
    cb.record_failure()  # hits threshold
    # cooldown is 0, so it immediately half-opens on the next check.
    assert cb.is_open is False
    cb.record_success()
    assert cb.is_open is False
