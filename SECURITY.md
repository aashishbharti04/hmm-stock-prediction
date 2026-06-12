# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅        |
| < 1.0   | ❌        |

## Reporting a Vulnerability

We take security seriously. If you discover a vulnerability, **please do not
open a public issue.** Instead:

1. Email **aashish@marketdoctorsonline.com** with:
   - A description of the issue and its impact.
   - Steps to reproduce (proof-of-concept if possible).
   - Affected component(s) and version(s).
2. You'll receive an acknowledgement within **72 hours**.
3. We'll work with you on a fix and coordinate a disclosure timeline.

Please give us a reasonable window to address the issue before any public
disclosure.

## Scope & Hardening

This project follows several security best practices:

- **Input validation** — all API input is validated and constrained via Pydantic
  schemas (ticker format, bounded state counts and forecast horizons).
- **No secrets in code** — configuration is via environment variables; `.env`
  files are git-ignored and only `.env.example` (with placeholders) is committed.
- **CORS** — the backend restricts origins via the `CORS_ORIGINS` setting.
- **Security headers** — the frontend sets `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- **No client secrets** — only `NEXT_PUBLIC_*` (non-sensitive) values reach the
  browser.
- **Dependency hygiene** — CI runs on every PR; keep dependencies patched.

## Disclaimer

This software is provided for **educational and research purposes only**. It does
not constitute financial advice. Market predictions are inherently uncertain;
use at your own risk.
