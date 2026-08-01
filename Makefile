.PHONY: up down build sqlc test logs dev-db dev-db-down dev-sqlc dev-backend dev-frontend dev-test

DEV_DATABASE_URL := postgres://observer:observer@localhost:5432/observer?sslmode=disable

## --- Full stack in Docker (no local Go/Node/sqlc needed) -------------------

up:
	docker compose up --build

down:
	docker compose down -v

build:
	docker compose build

sqlc:
	docker run --rm -v $(PWD)/backend:/src -w /src sqlc/sqlc:1.31.1 generate

# Runs go test with a containerized Go toolchain, mounting colima's Docker
# socket so testcontainers-go can spin up its own throwaway Postgres as a
# sibling container. TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE tells testcontainers
# the socket path as seen by the colima VM's own dockerd (not this host's
# forwarded path), which is what it needs to bind-mount into Ryuk.
test:
	docker run --rm \
		-v $(HOME)/.colima/default/docker.sock:/var/run/docker.sock \
		-v $(PWD)/backend:/src \
		-w /src \
		-e DOCKER_HOST=unix:///var/run/docker.sock \
		-e TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock \
		golang:1.26 go test ./...

logs:
	docker compose logs -f

## --- Native inner loop: Postgres in Docker, backend/frontend run locally ---
## Requires: colima running, and go/node/sqlc installed locally (brew).

dev-db:
	docker compose up -d seed

dev-db-down:
	docker compose down -v

dev-sqlc:
	cd backend && sqlc generate

dev-backend:
	cd backend && DATABASE_URL=$(DEV_DATABASE_URL) PORT=8080 go run ./cmd/server

dev-frontend:
	cd frontend && npm install && VITE_API_URL=http://localhost:8080 npm run dev

# Runs go test directly against a local Go toolchain. Still needs Docker
# (via colima) since testcontainers-go spins up its own Postgres container.
dev-test:
	cd backend && go test ./...
