# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Multi-ticker regime comparison view
- Persisted analysis history
- Exportable PDF/PNG reports

## [2.0.0] - 2026-06-14

### Added
- **Modeling rigor**
  - Multi-restart EM fitting — keeps the best-likelihood model across N random restarts.
  - Automatic regime-count selection via **BIC/AIC** (`auto_select_states`), with
    per-candidate scores surfaced in the API and UI.
  - **Walk-forward backtesting** (`POST /api/v1/backtest`) — out-of-sample
    directional accuracy, RMSE and MAPE versus a naive baseline.
  - Model diagnostics (log-likelihood, AIC, BIC, free params, convergence) in every response.
  - Forecast band now uses the full **mixture variance** (within- + between-state).
- **Backend hardening**
  - Result **caching** (in-memory TTL/LRU, optional **Redis** via `REDIS_URL`).
  - Per-client **rate limiting** with `X-RateLimit-*` headers.
  - Optional **API-key auth** (`API_KEYS` → `X-API-Key`).
  - **Prometheus** metrics at `/metrics`; request/fit/analysis instrumentation.
  - **JSON structured logging** with per-request correlation IDs (`X-Request-ID`).
  - `yfinance` layer gains **retries with backoff** and a **circuit breaker**.
  - `/ready` readiness probe and `/cache/stats`.
- **Infrastructure**
  - **docker-compose** stack (backend + frontend + Redis) with healthchecks.
  - **Multi-stage** Docker images (backend & frontend), non-root, healthchecked;
    Next.js `standalone` output.
  - Security CI: **CodeQL**, **Trivy**, **SBOM (SPDX)**; **pre-commit** (ruff, mypy,
    gitleaks); `Makefile`.
- **Frontend**
  - **TanStack Query** for caching, retries and cancellation.
  - Model-diagnostics panel and an "auto-select (BIC)" control.
  - **Playwright** end-to-end tests, wired into CI.

### Changed
- `AnalysisResponse` adds `diagnostics` and `cached` fields (backward-compatible additions).
- CI now enforces **mypy** (was advisory) and runs the E2E suite as a deploy gate.

### Security
- Secrets scanning (gitleaks), container/filesystem CVE scanning (Trivy), and
  static analysis (CodeQL) on every push and weekly schedule.

## [1.0.0] - 2026-06-12

### Added
- **Backend** — FastAPI service with a Gaussian HMM engine (`hmmlearn`):
  - `/api/v1/analyze` (POST & GET) — fetch data, fit HMM, decode regimes, forecast.
  - `/api/v1/health` — liveness/readiness probe.
  - Market-data layer over `yfinance` with a deterministic synthetic fallback.
  - Pydantic-validated request/response schemas.
  - Unit + integration tests (offline, deterministic).
- **Frontend** — Next.js 14 (App Router) + TypeScript + Tailwind dashboard:
  - Price chart with a per-day regime ribbon.
  - Forecast chart with a 95% uncertainty band.
  - Regime statistics table and transition-probability heatmap.
  - Light/dark mode, loading skeletons, empty & error states.
  - Accessibility (skip link, focus rings, reduced-motion) and SEO (metadata,
    robots, sitemap, manifest).
  - Graceful in-browser demo dataset when the backend is offline.
- **Project** — MIT license, contributing guide, code of conduct, security
  policy, issue/PR templates, and CI workflows (lint, typecheck, test, build).
- **Docs** — architecture, folder structure, API, deployment, and development
  guides.

[Unreleased]: https://github.com/aashishbharti04/hmm-stock-prediction/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/aashishbharti04/hmm-stock-prediction/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/aashishbharti04/hmm-stock-prediction/releases/tag/v1.0.0
