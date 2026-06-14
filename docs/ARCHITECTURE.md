# Architecture

## Overview

HMM Stock Prediction is a two-tier application:

```
┌──────────────────────────┐         HTTPS / JSON         ┌──────────────────────────┐
│        Frontend          │  ───────────────────────────▶│         Backend          │
│  Next.js 16 · TypeScript │   POST /api/v1/analyze        │   FastAPI · Python       │
│  Tailwind · Recharts     │◀───────────────────────────  │   hmmlearn · yfinance    │
│                          │      AnalysisResponse         │                          │
└──────────────────────────┘                              └────────────┬─────────────┘
                                                                        │
                                                                        ▼
                                                            ┌──────────────────────────┐
                                                            │   Market data (yfinance) │
                                                            │   + synthetic fallback   │
                                                            └──────────────────────────┘
```

The frontend is a stateless dashboard; all modeling happens in the backend. The
two communicate over a single JSON contract (`AnalysisResponse`).

## Data flow

1. **User input** — the dashboard `Controls` form submits `{ ticker, period,
   interval, n_states, forecast_days }`.
2. **Validation** — FastAPI validates the payload against `AnalysisRequest`
   (Pydantic). Bad input is rejected with `422` before any work is done.
3. **Acquisition** — `services/market_data.py` fetches OHLCV history via
   `yfinance`. If that fails (offline, rate-limited, unknown ticker), it falls
   back to a deterministic **synthetic** series so the app stays functional.
4. **Modeling** — `services/hmm_engine.py`:
   - computes daily **log-returns**,
   - fits a **Gaussian HMM** (Baum–Welch / EM) over the returns,
   - decodes the most-likely hidden-state path (**Viterbi**),
   - labels states Bullish / Bearish / Neutral by mean return,
   - estimates per-state statistics and the transition matrix.
5. **Forecasting** — the state distribution is propagated forward through the
   transition matrix; expected returns and a volatility-based 95% band produce
   the forecast path.
6. **Serialization** — `services/analysis.py` assembles an `AnalysisResponse`.
7. **Rendering** — the dashboard renders KPI cards, the price + regime ribbon,
   the forecast chart, the transition heatmap, and the statistics table.

## Backend layering

| Layer        | Module                         | Responsibility                              |
|--------------|--------------------------------|---------------------------------------------|
| API          | `app/api/routes.py`            | HTTP routing, error → status mapping        |
| Schemas      | `app/schemas/stock.py`         | Validation boundary (input/output contracts)|
| Orchestration| `app/services/analysis.py`     | Coordinate data + model + forecast          |
| Modeling     | `app/services/hmm_engine.py`   | Framework-agnostic HMM core (unit-tested)   |
| Data         | `app/services/market_data.py`  | yfinance wrapper + synthetic fallback       |
| Core         | `app/core/`                    | Settings, logging                           |

**Key principle:** the modeling core depends on nothing from FastAPI. It takes a
DataFrame and returns dataclasses, so it can be tested and reused in isolation.

## Frontend architecture

- **App Router** (`src/app/`) — server components for layout/SEO; the dashboard
  itself is a client component (interactive state, charts).
- **Components** are split into `dashboard/` (feature), `layout/` (header/footer),
  `theme/` (dark mode), and `ui/` (reusable primitives).
- **`lib/`** holds the typed API client, formatting helpers, regime styling, and
  site constants. The API client includes a graceful **demo fallback** that
  renders an in-browser synthetic dataset when the backend is unreachable.
- **State** is local and minimal (`useState` + `AbortController` in
  `Dashboard.tsx`) — no global store needed for a single-view dashboard.

## Design decisions & trade-offs

- **Gaussian HMM on log-returns** — returns are closer to stationary than raw
  prices, which makes regimes more identifiable.
- **Synthetic fallback on both tiers** — guarantees the app and its tests run
  fully offline and deterministically (important for CI and demos).
- **No database** — analyses are computed on demand and are cheap; persistence
  is intentionally out of scope for v1 (see CHANGELOG "Planned").
- **Recharts over a heavier charting lib** — good DX, small enough bundle, SSR-safe
  when wrapped in client components.

## Security posture

See [SECURITY.md](../SECURITY.md). Highlights: strict input validation, CORS
allow-list, frontend security headers, env-var-only configuration, and no
secrets shipped to the browser.
