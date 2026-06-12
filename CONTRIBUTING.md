# Contributing to HMM Stock Prediction

First off — thank you for taking the time to contribute! 🎉 This project is
open source and welcomes contributions of all kinds: bug reports, feature
ideas, documentation, and code.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Branch & Commit Conventions](#branch--commit-conventions)
- [Coding Standards](#coding-standards)
- [Running Tests & Checks](#running-tests--checks)
- [Submitting a Pull Request](#submitting-a-pull-request)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By
participating, you are expected to uphold it. Please report unacceptable
behavior to **aashish@marketdoctorsonline.com**.

## Ways to Contribute

- 🐛 **Report bugs** using the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md).
- 💡 **Request features** using the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md).
- 📖 **Improve docs** — typos, clarifications, and examples are all welcome.
- 🧪 **Add tests** — coverage for edge cases is always appreciated.
- ⚙️ **Submit code** — see the workflow below.

## Development Setup

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the full guide. In short:

```bash
# Backend (Python 3.10–3.12 recommended)
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload

# Frontend (Node 18+)
cd frontend
npm install
npm run dev
```

> **Note:** `hmmlearn`/`pydantic-core` need prebuilt wheels. Use Python
> **3.10–3.12** — 3.13/3.14 may force a slow source build.

## Project Structure

```
backend/    FastAPI + hmmlearn HMM engine
frontend/   Next.js + TypeScript dashboard
docs/       Architecture, API, deployment, development docs
.github/    Issue/PR templates and CI workflows
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and
[docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) for details.

## Branch & Commit Conventions

- Branch from `main`: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`.
- Use [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat: add multi-ticker comparison`
  - `fix: handle empty yfinance response`
  - `docs: clarify forecast methodology`
  - `test:`, `refactor:`, `chore:`, `ci:` …

## Coding Standards

**Python**
- Formatted & linted with **Ruff**; type-checked with **mypy**.
- Keep the modeling core (`services/`) framework-agnostic and unit-testable.

**TypeScript / React**
- `strict` mode; no `any` unless justified with a comment.
- Linted with **ESLint** (`next/core-web-vitals`), formatted with **Prettier**.
- Prefer small, focused, reusable components.

## Running Tests & Checks

```bash
# Backend
cd backend
pytest
ruff check .
mypy app

# Frontend
cd frontend
npm run lint
npm run typecheck
npm run build
```

All of the above also run automatically in CI on every pull request.

## Submitting a Pull Request

1. Fork the repo and create your branch from `main`.
2. Make your change, with tests where it makes sense.
3. Ensure all checks pass locally.
4. Fill out the [Pull Request template](.github/PULL_REQUEST_TEMPLATE.md).
5. Link any related issues (e.g. `Closes #12`).

We aim to review PRs promptly. Thanks again for contributing! 💙
