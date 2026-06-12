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
    app_version: str = "1.0.0"
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

    # --- Rate limiting / safety ----------------------------------------
    max_forecast_days: int = 30

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse the comma-separated CORS origins into a clean list."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """Return a cached singleton ``Settings`` instance."""
    return Settings()


settings = get_settings()
