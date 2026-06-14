"""Prometheus metrics.

The dependency is optional: if ``prometheus_client`` is not installed the
helpers degrade to no-ops so the application still runs (useful for slim
deployments and tests). When present, ``/metrics`` exposes the standard
text-exposition format.
"""

from __future__ import annotations

from app.core.logging import get_logger

logger = get_logger(__name__)

try:
    from prometheus_client import (
        CONTENT_TYPE_LATEST,
        Counter,
        Histogram,
        generate_latest,
    )

    _ENABLED = True
except ImportError:  # pragma: no cover - optional dependency
    _ENABLED = False
    CONTENT_TYPE_LATEST = "text/plain; version=0.0.4; charset=utf-8"


if _ENABLED:
    REQUEST_COUNT = Counter(
        "hmm_http_requests_total",
        "Total HTTP requests.",
        ["method", "path", "status"],
    )
    REQUEST_LATENCY = Histogram(
        "hmm_http_request_duration_seconds",
        "HTTP request latency in seconds.",
        ["method", "path"],
    )
    ANALYSIS_COUNT = Counter(
        "hmm_analysis_total",
        "Total analysis runs.",
        ["source", "cache"],  # source=live|synthetic, cache=hit|miss
    )
    MODEL_FIT_LATENCY = Histogram(
        "hmm_model_fit_duration_seconds",
        "HMM fit latency in seconds.",
    )


def observe_request(method: str, path: str, status: int, duration: float) -> None:
    if not _ENABLED:
        return
    REQUEST_COUNT.labels(method=method, path=path, status=str(status)).inc()
    REQUEST_LATENCY.labels(method=method, path=path).observe(duration)


def observe_analysis(source: str, cache: str) -> None:
    if not _ENABLED:
        return
    ANALYSIS_COUNT.labels(source=source, cache=cache).inc()


def observe_model_fit(duration: float) -> None:
    if not _ENABLED:
        return
    MODEL_FIT_LATENCY.observe(duration)


def render_latest() -> tuple[bytes, str]:
    """Return (payload, content_type) for the /metrics endpoint."""
    if not _ENABLED:
        return (b"# prometheus_client not installed\n", CONTENT_TYPE_LATEST)
    return (generate_latest(), CONTENT_TYPE_LATEST)


def metrics_enabled() -> bool:
    return _ENABLED
