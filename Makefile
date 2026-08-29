.PHONY: build run test lint tidy clean docker-up docker-down

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
