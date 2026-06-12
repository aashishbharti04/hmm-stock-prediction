# Backend — HMM Stock Prediction API

FastAPI service that fetches market data, fits a Gaussian Hidden Markov Model to
detect market regimes, and forecasts future prices.

## Quick start

```bash
cd backend
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs for interactive API docs.

## Endpoints

| Method | Path                | Description                              |
|--------|---------------------|------------------------------------------|
| GET    | `/api/v1/health`    | Liveness/readiness probe                 |
| POST   | `/api/v1/analyze`   | Run full HMM analysis (JSON body)        |
| GET    | `/api/v1/analyze`   | Same, via query params (demo-friendly)   |

See [`../docs/API.md`](../docs/API.md) for the full request/response contract.

## Testing

```bash
pytest            # runs offline using a deterministic synthetic series
ruff check .      # lint
mypy app          # type-check
```

## Architecture

```
app/
├── main.py            # FastAPI app factory + middleware
├── api/routes.py      # HTTP routes, error mapping
├── core/              # config, logging
├── schemas/           # Pydantic request/response models (validation boundary)
└── services/          # market_data · hmm_engine · analysis (business logic)
```

The modeling core (`services/hmm_engine.py`) is framework-agnostic and unit
tested independently of FastAPI.
