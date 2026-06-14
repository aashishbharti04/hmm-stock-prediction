"""A small, dependency-light caching layer.

Defaults to a thread-safe in-process TTL+LRU cache so the service caches
expensive HMM fits with zero external infrastructure. If ``REDIS_URL`` is set
*and* ``redis`` is installed, a shared Redis-backed cache is used instead so
multiple replicas share results.

Values are JSON-serialisable dicts (our Pydantic responses serialise cleanly),
which keeps both backends interchangeable.
"""

from __future__ import annotations

import json
import threading
import time
from collections import OrderedDict
from typing import Any, Protocol

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class CacheBackend(Protocol):
    def get(self, key: str) -> dict[str, Any] | None: ...
    def set(self, key: str, value: dict[str, Any]) -> None: ...
    def clear(self) -> None: ...
    def stats(self) -> dict[str, int]: ...


class InMemoryTTLCache:
    """Thread-safe TTL cache with LRU eviction."""

    def __init__(self, ttl_seconds: int, max_entries: int) -> None:
        self._ttl = ttl_seconds
        self._max = max_entries
        self._store: OrderedDict[str, tuple[float, dict[str, Any]]] = OrderedDict()
        self._lock = threading.Lock()
        self._hits = 0
        self._misses = 0

    def get(self, key: str) -> dict[str, Any] | None:
        now = time.monotonic()
        with self._lock:
            item = self._store.get(key)
            if item is None:
                self._misses += 1
                return None
            expires_at, value = item
            if expires_at < now:
                # Expired — drop it.
                del self._store[key]
                self._misses += 1
                return None
            self._store.move_to_end(key)
            self._hits += 1
            return value

    def set(self, key: str, value: dict[str, Any]) -> None:
        with self._lock:
            self._store[key] = (time.monotonic() + self._ttl, value)
            self._store.move_to_end(key)
            while len(self._store) > self._max:
                self._store.popitem(last=False)  # evict least-recently-used

    def clear(self) -> None:
        with self._lock:
            self._store.clear()

    def stats(self) -> dict[str, int]:
        with self._lock:
            return {
                "entries": len(self._store),
                "hits": self._hits,
                "misses": self._misses,
            }


class RedisCache:
    """Redis-backed cache. Falls back transparently on connection errors."""

    def __init__(self, url: str, ttl_seconds: int) -> None:
        import redis  # imported lazily; optional dependency

        self._client = redis.Redis.from_url(url, decode_responses=True)
        self._ttl = ttl_seconds
        self._hits = 0
        self._misses = 0
        self._prefix = "hmm:"

    def get(self, key: str) -> dict[str, Any] | None:
        try:
            raw = self._client.get(self._prefix + key)
        except Exception as exc:  # noqa: BLE001 - cache must never break requests
            logger.warning("Redis get failed (%s); treating as miss", exc)
            return None
        if raw is None:
            self._misses += 1
            return None
        self._hits += 1
        return json.loads(raw)

    def set(self, key: str, value: dict[str, Any]) -> None:
        try:
            self._client.setex(self._prefix + key, self._ttl, json.dumps(value))
        except Exception as exc:  # noqa: BLE001
            logger.warning("Redis set failed (%s); skipping cache write", exc)

    def clear(self) -> None:
        try:
            for k in self._client.scan_iter(self._prefix + "*"):
                self._client.delete(k)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Redis clear failed (%s)", exc)

    def stats(self) -> dict[str, int]:
        return {"hits": self._hits, "misses": self._misses, "entries": -1}


def _build_backend() -> CacheBackend:
    if settings.redis_url:
        try:
            backend: CacheBackend = RedisCache(
                settings.redis_url, settings.cache_ttl_seconds
            )
            logger.info("Cache backend: Redis (%s)", settings.redis_url)
            return backend
        except Exception as exc:  # noqa: BLE001 - fall back to memory
            logger.warning("Redis unavailable (%s); using in-memory cache", exc)
    logger.info("Cache backend: in-memory TTL/LRU")
    return InMemoryTTLCache(
        ttl_seconds=settings.cache_ttl_seconds,
        max_entries=settings.cache_max_entries,
    )


# Module-level singleton, built once at import.
cache: CacheBackend = _build_backend()
