# Folder Structure

```
hmm-stock-prediction/
│
├── backend/                     # FastAPI + HMM modeling service
│   ├── app/
│   │   ├── main.py              # App factory, middleware, root route
│   │   ├── api/
│   │   │   └── routes.py        # /health and /analyze endpoints
│   │   ├── core/
│   │   │   ├── config.py        # Pydantic settings (env-driven)
│   │   │   └── logging.py       # Logging configuration
│   │   ├── schemas/
│   │   │   └── stock.py         # Request/response models (validation boundary)
│   │   └── services/
│   │       ├── analysis.py      # Orchestrates data → model → forecast
│   │       ├── hmm_engine.py    # Gaussian HMM core (fit, decode, forecast)
│   │       ├── market_data.py   # yfinance wrapper + synthetic fallback
│   │       └── exceptions.py    # Domain exceptions
│   ├── tests/                   # pytest suite (offline, deterministic)
│   ├── requirements.txt         # Runtime dependencies
│   ├── requirements-dev.txt     # + test/lint/type tooling
│   ├── pyproject.toml           # ruff / mypy / pytest config
│   ├── Dockerfile               # Container image (non-root)
│   ├── .env.example             # Backend env template
│   └── README.md
│
├── frontend/                    # Next.js 14 dashboard
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx       # Root layout, SEO metadata, theme provider
│   │   │   ├── page.tsx         # Dashboard page (hero + Dashboard)
│   │   │   ├── globals.css      # Design tokens (light/dark) + base styles
│   │   │   ├── error.tsx        # Route error boundary
│   │   │   ├── not-found.tsx    # 404 page
│   │   │   ├── icon.svg         # Favicon
│   │   │   ├── manifest.ts      # PWA web manifest
│   │   │   ├── robots.ts        # robots.txt (SEO)
│   │   │   └── sitemap.ts       # sitemap.xml (SEO)
│   │   ├── components/
│   │   │   ├── dashboard/       # Dashboard, Controls, charts, tables, states
│   │   │   ├── layout/          # Header, Footer
│   │   │   ├── theme/           # ThemeProvider, ThemeToggle
│   │   │   └── ui/              # Card, Badge, Skeleton primitives
│   │   ├── lib/                 # api, format, regime, site, cn helpers
│   │   └── types/               # Shared TS contracts (mirror backend)
│   ├── scripts/
│   │   └── screenshot.mjs       # Playwright screenshot generator
│   ├── public/                  # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.mjs          # Security headers, image config
│   └── .env.example             # Frontend env template
│
├── docs/                        # Project documentation
│   ├── ARCHITECTURE.md
│   ├── FOLDER_STRUCTURE.md      # (this file)
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── DEVELOPMENT.md
│   └── screenshots/             # README images
│
├── .github/
│   ├── ISSUE_TEMPLATE/          # Bug report, feature request, config
│   ├── workflows/               # CI + dependency review
│   ├── dependabot.yml
│   └── PULL_REQUEST_TEMPLATE.md
│
├── README.md                    # Project overview (start here)
├── LICENSE                      # MIT
├── CONTRIBUTING.md
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── .gitignore
```

## Conventions

- **One responsibility per module.** Data acquisition, modeling, and
  orchestration are separate files in the backend; UI primitives, features, and
  helpers are separate folders in the frontend.
- **Validation lives at the edges.** Pydantic schemas (backend) and TypeScript
  types (frontend) define the contract; everything inside trusts validated data.
- **No secrets in the tree.** Only `*.env.example` templates are committed.
