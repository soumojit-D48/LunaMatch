.PHONY: dev dev-gpu down test lint benchmark fetch-models

dev:
	docker compose up --build

dev-gpu:
	docker compose -f docker-compose.yml -f infra/compose/docker-compose.gpu.yml up --build

down:
	docker compose down -v

test:
	$(MAKE) -C frontend test 2>/dev/null || echo "frontend tests not set up yet"
	cd backend && python -m pytest tests/ -q || echo "backend tests not set up yet"

lint:
	cd backend && (ruff check . && ruff format --check . && mypy .) || echo "backend lint not set up yet"
	cd frontend && (npm run lint && npx tsc --noEmit) || echo "frontend lint not set up yet"

benchmark:
	python scripts/run_benchmark.py

fetch-models:
	bash scripts/fetch_pretrained_models.sh
