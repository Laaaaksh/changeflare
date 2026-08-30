.PHONY: build run test lint tidy clean docker-up docker-down demo

build:
	npm install
	npm run build

run:
	npm run dev

test:
	npm test

lint:
	npm run lint

tidy:
	npm run format

clean:
	rm -rf node_modules apps/web/node_modules packages/widget/node_modules
	rm -rf apps/web/.next packages/widget/dist apps/web/public/widget.js apps/web/public/widget.js.map

# Self-hosting via Docker: brings up Postgres, runs pending migrations, then the app.
docker-up:
	docker compose up --build

docker-down:
	docker compose down

# Boots a fresh stack, records a real end-to-end walkthrough with Playwright,
# and converts it into docs/assets/demo.mp4 + demo.gif. See
# scripts/record-demo/README.md for details and manual re-run steps.
demo:
	docker compose down -v
	docker compose up --build -d
	@echo "Waiting for the app to become reachable..."
	@until curl -sS -o /dev/null http://localhost:$${APP_PORT:-3000}/setup; do sleep 1; done
	cd scripts/record-demo && npm install && npx playwright install --with-deps chromium
	cd scripts/record-demo && CHANGEFLARE_URL=http://localhost:$${APP_PORT:-3000} npm run record
	cd scripts/record-demo && ./convert.sh
	docker compose down -v
