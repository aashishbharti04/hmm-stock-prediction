"""Optional API-key authentication.

Auth is *opt-in*: if no keys are configured (``API_KEYS`` empty) the dependency
is a no-op, keeping local development and the open-source demo frictionless. In
production, set ``API_KEYS`` to one or more comma-separated secrets and clients
must send a matching ``X-API-Key`` header.
"""

from __future__ import annotations

from fastapi import Header, HTTPException, status

from app.core.config import settings


async def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    """FastAPI dependency enforcing the ``X-API-Key`` header when auth is on."""
    if not settings.auth_enabled:
        return
    if x_api_key is None or x_api_key not in settings.api_key_set:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid API key.",
            headers={"WWW-Authenticate": "API-Key"},
        )
