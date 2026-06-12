# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Multi-ticker regime comparison view
- Persisted analysis history
- Exportable PDF/PNG reports

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

[Unreleased]: https://github.com/aashishbharti04/hmm-stock-prediction/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/aashishbharti04/hmm-stock-prediction/releases/tag/v1.0.0
