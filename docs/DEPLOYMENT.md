# Deployment

The frontend and backend deploy independently. A common setup is **Vercel
(frontend) + a container host (backend)**, but anything that runs Node and
Python works.

## Architecture recap

```
[ Browser ] → [ Frontend (Next.js, static/SSR) ] → [ Backend (FastAPI) ] → [ yfinance ]
```

Set `NEXT_PUBLIC_API_BASE_URL` on the frontend to the backend's public URL, and
add the frontend's origin to the backend's `CORS_ORIGINS`.

---

## Frontend

### Vercel (recommended)

1. Import the repo into Vercel and set **Root Directory** to `frontend`.
2. Framework preset: **Next.js** (auto-detected).
3. Environment variables:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://api.your-domain.com/api/v1`
   - `NEXT_PUBLIC_SITE_URL` = `https://your-domain.com`
4. Deploy. Vercel runs `next build` and serves it.

### Any Node host

```bash
cd frontend
npm ci
npm run build
npm run start        # serves on $PORT (default 3000)
```

---

## Backend

### Docker (recommended)

```bash
cd backend
docker build -t hmm-api .
docker run -p 8000:8000 \
  -e ENVIRONMENT=production \
  -e CORS_ORIGINS=https://your-domain.com \
  hmm-api
```

The image runs as a non-root user and starts uvicorn on port 8000.

### Container platforms

The same image deploys to **Render**, **Railway**, **Fly.io**, **Google Cloud
Run**, **AWS App Runner**, etc. Configure:

- Port: `8000`
- Env: `ENVIRONMENT=production`, `CORS_ORIGINS=<frontend origin>`
- Health check path: `/api/v1/health`

### Bare VM / systemd

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

Put it behind Nginx/Caddy for TLS.

---

## Production checklist

- [ ] `ENVIRONMENT=production` and `DEBUG=false` on the backend
- [ ] `CORS_ORIGINS` lists only your real frontend origin(s)
- [ ] HTTPS/TLS terminated in front of both tiers
- [ ] `NEXT_PUBLIC_API_BASE_URL` points at the public backend URL
- [ ] Backend `/api/v1/health` wired to the platform's health check
- [ ] Logs shipped to your monitoring of choice
- [ ] Dependencies patched (Dependabot PRs reviewed)

> **Note:** `yfinance` scrapes a public data source and may rate-limit under
> heavy load. For production traffic, add caching or a licensed market-data
> provider behind the same `market_data` interface.
