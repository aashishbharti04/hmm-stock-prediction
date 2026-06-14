"""Cross-cutting HTTP middleware: correlation ids, access logs, metrics, limits."""

from __future__ import annotations

import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.core.config import settings
from app.core.logging import get_logger, set_request_id
from app.core.metrics import observe_request
from app.core.ratelimit import limiter

logger = get_logger("access")

REQUEST_ID_HEADER = "X-Request-ID"


def _client_key(request: Request) -> str:
    """Identify the caller for rate-limiting (API key first, then client IP)."""
    api_key = request.headers.get("x-api-key")
    if api_key:
        return f"key:{api_key}"
    client = request.client
    return f"ip:{client.host}" if client else "ip:unknown"


class ObservabilityMiddleware(BaseHTTPMiddleware):
    """Assign a request id, time the request, log it, and record metrics."""

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get(REQUEST_ID_HEADER) or uuid.uuid4().hex[:12]
        set_request_id(request_id)

        start = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            duration = time.perf_counter() - start
            logger.exception(
                "%s %s -> 500 in %.1fms",
                request.method,
                request.url.path,
                duration * 1000,
            )
            observe_request(request.method, request.url.path, 500, duration)
            raise

        duration = time.perf_counter() - start
        response.headers[REQUEST_ID_HEADER] = request_id
        response.headers["X-Response-Time-ms"] = f"{duration * 1000:.1f}"

        logger.info(
            "%s %s -> %d in %.1fms",
            request.method,
            request.url.path,
            response.status_code,
            duration * 1000,
        )
        observe_request(
            request.method, request.url.path, response.status_code, duration
        )
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Fixed-window rate limiting applied to the JSON API surface."""

    async def dispatch(self, request: Request, call_next):
        if not settings.rate_limit_enabled or not request.url.path.startswith(
            "/api/"
        ):
            return await call_next(request)

        allowed, remaining, retry_after = limiter.check(_client_key(request))
        if not allowed:
            logger.warning("Rate limit exceeded for %s", _client_key(request))
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Slow down."},
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(settings.rate_limit_requests),
                    "X-RateLimit-Remaining": "0",
                },
            )

        response: Response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(settings.rate_limit_requests)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response
