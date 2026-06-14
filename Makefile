# Developer convenience targets. Run `make help` for the list.
.DEFAULT_GOAL := help
.PHONY: help install backend frontend test lint typecheck fmt e2e \
        docker-up docker-down precommit clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install backend + frontend dependencies
	cd backend && pip install -r requirements-dev.txt
	cd frontend && npm install

backend: ## Run the API with autoreload
	cd backend && uvicorn app.main:app --reload --port 8000

frontend: ## Run the Next.js dev server
	cd frontend && npm run dev

test: ## Run backend tests with coverage
	cd backend && pytest --cov=app --cov-report=term-missing

lint: ## Lint backend (ruff) and frontend (eslint)
	cd backend && ruff check .
	cd frontend && npm run lint

typecheck: ## Type-check backend (mypy) and frontend (tsc)
	cd backend && mypy app
	cd frontend && npm run typecheck

fmt: ## Auto-format backend (ruff) and frontend (prettier)
	cd backend && ruff check --fix . && ruff format .
	cd frontend && npm run format

e2e: ## Run Playwright end-to-end tests
	cd frontend && npm run test:e2e

docker-up: ## Build and start the full stack (backend + frontend + redis)
	docker compose up --build

docker-down: ## Stop the stack
	docker compose down

precommit: ## Run all pre-commit hooks across the repo
	pre-commit run --all-files

clean: ## Remove caches and build artifacts
	find . -type d -name __pycache__ -prune -exec rm -rf {} + 2>/dev/null || true
	rm -rf backend/.pytest_cache backend/.mypy_cache backend/.ruff_cache
	rm -rf frontend/.next frontend/playwright-report frontend/test-results
