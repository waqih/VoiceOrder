.PHONY: help up down build logs db-migrate db-upgrade db-downgrade server-shell agent-shell dashboard-shell lint test

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Start all services
	docker compose up -d

down: ## Stop all services
	docker compose down

build: ## Build all Docker images
	docker compose build

logs: ## Tail logs for all services
	docker compose logs -f

db-migrate: ## Create a new migration (usage: make db-migrate msg="add xyz")
	docker compose exec server uv run alembic revision --autogenerate -m "$(msg)"

db-upgrade: ## Run all pending migrations
	docker compose exec server uv run alembic upgrade head

db-downgrade: ## Revert last migration
	docker compose exec server uv run alembic downgrade -1

server-shell: ## Open shell in server container
	docker compose exec server bash

agent-shell: ## Open shell in agent container
	docker compose exec agent bash

dashboard-shell: ## Open shell in dashboard container
	docker compose exec dashboard sh

lint: ## Run linters across all services
	docker compose exec server uv run ruff check src/
	docker compose exec server uv run ruff format --check src/
	docker compose exec agent uv run ruff check src/
	docker compose exec agent uv run ruff format --check src/
	docker compose exec dashboard pnpm lint

test: ## Run tests across all services
	docker compose exec server uv run pytest
	docker compose exec dashboard pnpm test
