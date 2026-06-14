# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Dependency upgrades** (consolidates the open Dependabot PRs):
  - Frontend: **Next.js 14 → 16** (Turbopack build; React 18 retained),
    **ESLint 8 → 9 with flat config** (`eslint.config.mjs`; `next lint` was
    removed in Next 16, so ESLint is invoked directly), eslint-config-next
    14 → 16, `@types/node` 20 → 25, next-themes 0.4.4 → 0.4.6, prettier 3.4 → 3.8.
  - Backend: pandas → 3.x, pytest → 9.x, mypy → 2.x, uvicorn 0.34 → 0.49,
    pydantic-settings 2.7 → 2.14.
  - CI actions: checkout v4 → v6, setup-node v4 → v6, setup-python v5 → v6,
    dependency-review-action v4 → v5.
  - `ThemeToggle` mount guard rewritten with `useSyncExternalStore` to satisfy
    React's newer `react-hooks/set-state-in-effect` rule.
  - Minimum Node bumped to **20.9** (Next.js 16 requirement).
- ESLint **10** was held back: the `eslint-plugin-react` bundled by
  eslint-config-next 16 is not yet compatible with the ESLint 10 rule API.

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
