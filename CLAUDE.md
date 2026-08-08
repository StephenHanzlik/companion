# CLAUDE.md

Context for AI agents picking up work on this repo. For setup/run commands, see
`README.md` — this file is about intent, decisions, and hard-won gotchas that
aren't visible from reading the code alone.

## What this is

A personal/hobby digital companion for backcountry ski touring trip planning
and decision-making, structured around a three-phase framework common in
avalanche education (see "Naming constraint" below for how to talk about
this):

- **Plan**: prepare a trip before leaving — objectives, route, avalanche/weather
  forecast, identified hazards, go/no-go checklist, sign-off.
- **Ride**: during the trip — timestamped field observations (weather, terrain,
  avalanche signs, red flags) and snow profile tests (compression test,
  extended column test, propagation saw test, pit profile).
- **Debrief**: after the trip — summary, decision-point reflections, lessons
  learned, and eventually submission to an external observation feed.

Explicitly a hobby project, not a commercial product — but the data model and
stack choices were made deliberately so it can scale cleanly if it ever needs
to, rather than needing a rewrite.

## Naming constraint

Never use "AIARE" (or spell out American Institute for Avalanche Research and
Education) anywhere in this codebase — code, comments, docs, commit messages,
UI copy. The user is deliberately avoiding referencing that specific
organization for copyright reasons, even though the Plan/Ride/Debrief
structure is inspired by their field book model. Use generic language ("a
structured backcountry trip planning framework," "avalanche education
programs") instead.

## Stack and why

- **Backend**: Go, `chi` router, `pgx/v5`, `sqlc` for typed SQL — no ORM.
  Chosen over GORM specifically because hand-written SQL + generated bindings
  keeps query behavior visible and tunable; this mirrors how Temporal's own
  server persistence layer works (raw SQL + a thin binding layer, no ORM
  magic), which was the deciding precedent during planning.
- **Database**: PostgreSQL, chosen over a document store. The core data (Trip
  → Plan/Observations/Debrief, with Debrief referencing specific
  Observations) is genuinely relational; JSONB columns handle the genuinely
  variable parts (snow profile test payloads, forecast blobs, checklists)
  without giving up relational integrity everywhere else.
- **Frontend**: React + Vite + TypeScript, plain `fetch`, no router library
  (state-based view switching is enough at this scale) and no query-caching
  library yet.
- **Mapping** (Weather POC only): Leaflet + react-leaflet + OpenStreetMap
  tiles — zero API keys, simplest path to "click a point, get lat/lng."
- **Local dev / test fixtures**: Docker throughout. `docker-compose.yml` runs
  the full stack; `testcontainers-go` spins up a real ephemeral Postgres for
  backend integration tests rather than mocking the DB layer. The local
  Docker runtime is **Colima**, not Docker Desktop (see gotchas below).

## Hard-won gotchas — don't re-derive these

1. **sqlc + pgx/v5's default type mapping is not what you'd guess.**
   `timestamptz` and `date` columns map to `pgtype.Timestamptz`/`pgtype.Date`
   regardless of `NOT NULL` — not `time.Time`. `emit_pointers_for_null_types:
   true` does **not** combine with a type `override`: a nullable `uuid`
   column falls back to `pgtype.UUID`, not `*uuid.UUID`, even though the
   override cleanly maps non-null `uuid` columns to `google/uuid.UUID`. If
   you add a new nullable or typed column, check `internal/db/models.go`
   after regenerating rather than assuming — this broke the first build of
   `trips.go`, `observations.go`, and `snowtests.go`, all of which needed
   `pgtype.*` construction instead of plain Go types.
2. **Go nil slices marshal to JSON `null`, not `[]`.** sqlc's `:many` queries
   return a nil slice for zero rows. Any handler returning a list must
   explicitly coalesce (`if x == nil { x = []db.T{} }`) before `writeJSON`,
   or the frontend crashes calling `.map()`/`.length` on `null`. This is why
   `listTrips`, `listObservations`, and `listSnowProfileTests` all have that
   check — it's not defensive paranoia, it's a real bug that broke the Ride
   tab on any trip with zero entries.
3. **Colima's Docker socket is not at `/var/run/docker.sock`.** It's at
   `~/.colima/default/docker.sock`. `DOCKER_HOST` must point there, and
   `testcontainers-go`'s Ryuk reaper additionally needs
   `TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock` (the socket
   path as seen *inside* the Colima VM, not the host-forwarded path), or
   container creation fails with a bind-mount error. Both are set in the dev
   machine's `~/.zshrc` — that's machine-local, not repo-tracked, so a fresh
   clone/machine needs this redone. See `README.md`'s "Requirements on this
   machine" section, and `Makefile`'s `test` target for the container-based
   equivalent.
4. **sqlc 1.31.1 requires Go >= 1.26.** `backend/Dockerfile`'s base images
   are pinned to `golang:1.26-alpine` for this reason — don't drop them back
   to 1.23 without checking sqlc's current minimum.
5. **NWS elevation data is unreliable in mountain terrain — don't use it.**
   `api.weather.gov`'s observation stations are ranked by lat/lon proximity,
   not elevation, and cluster at airports (often in valleys, miles from and
   thousands of feet off the point a user actually clicked). Verified
   empirically: Nederland, CO (8,238 ft) came back as 5,289 ft — the
   elevation of Boulder Municipal Airport, 16 miles away. Fix:
   `internal/weather/client.go` gets elevation from USGS's Elevation Point
   Query Service (a real DEM, free, no key) instead, and only uses the
   nearest NWS station for current conditions/forecast — with
   `station_distance_mi` surfaced in the API response so the frontend can
   show how far that reading actually is from the selected point.
6. **Browsers block JS from setting `User-Agent`.** That's why `/api/weather`
   proxies through the Go backend instead of the frontend calling
   `api.weather.gov` directly — NWS asks for an identifying User-Agent, and
   only server-side code can set one.

## Where things stand / deliberately deferred

- No auth. A fixed-UUID demo user
  (`00000000-0000-0000-0000-000000000001`, seeded by
  `backend/db/seed/seed.sql`) stands in for a real user everywhere
  `owner_id`/`created_by` is needed.
- The Weather POC (`frontend/src/pages/WeatherPoc.tsx`,
  `backend/internal/weather/`) is intentionally decoupled from the Trip
  model — nothing it fetches is persisted. The natural next step, if picked
  up, is pulling a subset of it into `Plan.avalanche_forecast` /
  `Plan.weather_forecast` (JSONB columns already exist for this).
- No production frontend build/Dockerfile yet — only the Vite dev-server
  image (`frontend/Dockerfile.dev`).
- `go.sum` and `backend/internal/db/` (sqlc-generated) are the only backend
  artifacts *not* meant to be hand-edited; `internal/db/` is gitignored and
  regenerated by `make sqlc` / the backend Dockerfile's first build stage.
- No offline-first sync for field capture. Worth revisiting if this ever
  leaves cell coverage with real users — that's a client-side sync-layer
  problem, not a backend one.

## Where to look first

- `README.md` — actual setup/run commands: the full-Docker path
  (`make up`) and the native inner-loop path (Postgres in Docker via Colima,
  Go/Node run natively via `make dev-*` for fast iteration).
- `backend/db/schema.sql` — the whole data model in one place; table order
  and comments explain the Plan/Observation/SnowProfileTest/Debrief
  relationships.
- `backend/internal/httpapi/server.go` — the full route table.
