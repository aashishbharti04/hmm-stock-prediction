# Development Setup

This guide gets both tiers running locally for development.

## Prerequisites

| Tool    | Version            | Notes                                            |
|---------|--------------------|--------------------------------------------------|
| Python  | **3.10 – 3.12**    | 3.13/3.14 may force slow source builds of wheels |
| Node.js | **18.18+** (20 LTS)| For the Next.js frontend                         |
| Git     | any recent         |                                                  |

> ⚠️ **Python version matters.** `hmmlearn` and `pydantic-core` ship prebuilt
> wheels for 3.10–3.12. On 3.13+ pip may try to compile from source and fail
> without a Rust/C toolchain. If you hit build errors, use Python 3.12.

## 1. Clone

```bash
git clone https://github.com/aashishbharti04/hmm-stock-prediction.git
cd hmm-stock-prediction
```

## 2. Backend

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements-dev.txt
cp .env.example .env        # Windows: copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000
- Docs: http://localhost:8000/docs

Run the checks:

```bash
pytest                 # tests (offline, deterministic)
ruff check .           # lint
mypy app               # type-check
```

## 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env.local  # Windows: copy .env.example .env.local
npm run dev
```

- Dashboard: http://localhost:3000

The dashboard works even if the backend is down — it falls back to an in-browser
demo dataset. To analyze real tickers, keep the backend running and ensure
`NEXT_PUBLIC_API_BASE_URL` in `.env.local` points to it.

Run the checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## 4. Regenerating screenshots (optional)

```bash
cd frontend
npm run build && npm run start   # serve on :3000
node scripts/screenshot.mjs      # writes to ../docs/screenshots
```

(Requires `npx playwright install chromium` once.)

## Environment variables

**Backend** (`backend/.env`) — see `backend/.env.example`:
`ENVIRONMENT`, `DEBUG`, `HOST`, `PORT`, `CORS_ORIGINS`, modeling defaults.

**Frontend** (`frontend/.env.local`) — see `frontend/.env.example`:
`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SITE_URL`.

## Troubleshooting

| Symptom                                   | Fix                                                        |
|-------------------------------------------|------------------------------------------------------------|
| `Failed building wheel for hmmlearn`      | Use Python 3.10–3.12.                                       |
| Dashboard shows "Demo mode"               | Backend not reachable — start it and check the API URL.    |
| CORS error in browser console             | Add the frontend origin to `CORS_ORIGINS` in `backend/.env`.|
| `404` for a ticker                        | Ticker may be unknown/delisted; try another symbol.        |
