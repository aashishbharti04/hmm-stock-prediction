# Frontend — HMM Stock Prediction Dashboard

Next.js 14 (App Router) + TypeScript + Tailwind CSS dashboard for visualizing
Hidden Markov Model market-regime analysis.

## Quick start

```bash
cd frontend
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at the backend
npm run dev                  # http://localhost:3000
```

> The dashboard works even without the backend running — it falls back to a
> deterministic in-browser **demo dataset** so the UI is never empty.

## Scripts

| Script              | Description                       |
|---------------------|-----------------------------------|
| `npm run dev`       | Start the dev server              |
| `npm run build`     | Production build                  |
| `npm run start`     | Serve the production build        |
| `npm run lint`      | ESLint (next/core-web-vitals)     |
| `npm run typecheck` | `tsc --noEmit`                    |
| `npm run format`    | Prettier                          |

## Structure

```
src/
├── app/                 # App Router: layout, page, SEO routes, error/not-found
├── components/
│   ├── dashboard/       # Dashboard, charts, tables, controls, states
│   ├── layout/          # Header, Footer
│   ├── theme/           # ThemeProvider, ThemeToggle (light/dark)
│   └── ui/              # Card, Badge, Skeleton primitives
├── lib/                 # api client, formatting, regime styling, site constants
└── types/               # Shared TypeScript contracts (mirror backend schemas)
```

## Features

- 🌗 Light/dark mode (system-aware, no flash)
- 📈 Price + regime-ribbon chart, forecast chart with uncertainty band
- 🔢 Per-regime statistics and transition-probability heatmap
- ⏳ Loading skeletons, empty states, and error states
- ♿ Accessible: semantic landmarks, focus-visible rings, skip link, reduced-motion
- 🔍 SEO: metadata, OpenGraph, robots, sitemap, manifest
