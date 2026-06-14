"""Application configuration loaded from environment variables.

All settings can be overridden via environment variables or a local ``.env``
file (never commit real secrets — see ``.env.example``).
"""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Strongly-typed application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- App metadata ---------------------------------------------------
    app_name: str = "HMM Stock Prediction API"
    app_version: str = "2.0.0"
    environment: str = Field(default="development")
    debug: bool = Field(default=False)

    # --- Server ---------------------------------------------------------
    host: str = "0.0.0.0"
    port: int = 8000

    # --- CORS -----------------------------------------------------------
    # Comma-separated list of allowed origins for the browser frontend.
    cors_origins: str = "http://localhost:3000"

    # --- Modeling defaults ---------------------------------------------
    default_ticker: str = "AAPL"
    default_period: str = "2y"
    default_interval: str = "1d"
    max_hidden_states: int = 8
    default_hidden_states: int = 3
    hmm_n_iter: int = 100
    hmm_random_state: int = 42
    # Number of random EM restarts; the best log-likelihood fit wins. HMM EM is
    # sensitive to initialisation, so restarts materially improve stability.
    hmm_n_restarts: int = 8
    # When auto-selecting the regime count, search this inclusive range.
    model_selection_min_states: int = 2
    model_selection_max_states: int = 6

    # --- Forecast safety ------------------------------------------------
    max_forecast_days: int = 30

    # --- Caching --------------------------------------------------------
    # In-process TTL cache by default; set redis_url to use a shared cache.
    cache_enabled: bool = True
    cache_ttl_seconds: int = 900  # 15 minutes
    cache_max_entries: int = 256
    redis_url: str | None = None

    # --- Rate limiting --------------------------------------------------
    rate_limit_enabled: bool = True
    rate_limit_requests: int = 60  # requests per window per client
    rate_limit_window_seconds: int = 60

    # --- Auth (optional) ------------------------------------------------
    # When set, mutating analysis endpoints require ``X-API-Key`` to match.
    # Comma-separated to allow multiple keys (rotation). Empty = auth disabled.
    api_keys: str = ""

    # --- Observability --------------------------------------------------
    metrics_enabled: bool = True
    log_json: bool = False  # set true in production for machine-readable logs

    # --- Market data resilience ----------------------------------------
    data_fetch_retries: int = 3
    data_fetch_backoff_seconds: float = 0.5
    # Circuit breaker: after N consecutive failures, short-circuit for a cooldown.
    circuit_breaker_threshold: int = 5
    circuit_breaker_cooldown_seconds: float = 30.0

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse the comma-separated CORS origins into a clean list."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def api_key_set(self) -> frozenset[str]:
        """Parse configured API keys into a set (empty means auth disabled)."""
        return frozenset(k.strip() for k in self.api_keys.split(",") if k.strip())

    @property
    def auth_enabled(self) -> bool:
        return bool(self.api_key_set)

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """Return a cached singleton ``Settings`` instance."""
    return Settings()


settings = get_settings()
