package httpapi_test

// Integration test backed by a real, throwaway Postgres container
// (testcontainers-go) rather than mocks -- this needs a Docker daemon
// available at test-run time. Run it with `make test` from the repo root,
// which uses a containerized Go toolchain mounting the host's Docker socket
// so you don't need Go installed locally either.

import (
	"context"
	"os"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
	tcpostgres "github.com/testcontainers/testcontainers-go/modules/postgres"

	"observer/internal/db"
)

func setupTestDB(t *testing.T) *db.Queries {
	t.Helper()
	ctx := context.Background()

	container, err := tcpostgres.Run(ctx, "postgres:16-alpine",
		tcpostgres.WithDatabase("observer_test"),
		tcpostgres.WithUsername("observer"),
		tcpostgres.WithPassword("observer"),
		tcpostgres.BasicWaitStrategies(),
	)
	if err != nil {
		t.Fatalf("start postgres container: %v", err)
	}
	t.Cleanup(func() { _ = container.Terminate(ctx) })

	connStr, err := container.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		t.Fatalf("get connection string: %v", err)
	}

	schema, err := os.ReadFile("../../db/schema.sql")
	if err != nil {
		t.Fatalf("read schema.sql: %v", err)
	}

	pool, err := pgxpool.New(ctx, connStr)
	if err != nil {
		t.Fatalf("connect to test database: %v", err)
	}
	t.Cleanup(pool.Close)

	if _, err := pool.Exec(ctx, string(schema)); err != nil {
		t.Fatalf("apply schema: %v", err)
	}

	return db.New(pool)
}

func TestCreateAndGetTrip(t *testing.T) {
	q := setupTestDB(t)
	ctx := context.Background()

	user, err := q.CreateUser(ctx, db.CreateUserParams{
		Email:       "skier@example.com",
		DisplayName: "Test Skier",
	})
	if err != nil {
		t.Fatalf("create user: %v", err)
	}

	created, err := q.CreateTrip(ctx, db.CreateTripParams{
		OwnerID: user.ID,
		Title:   "Test Trip",
	})
	if err != nil {
		t.Fatalf("create trip: %v", err)
	}
	if created.Status != db.TripStatusPlanning {
		t.Errorf("expected default status 'planning', got %q", created.Status)
	}

	got, err := q.GetTrip(ctx, created.ID)
	if err != nil {
		t.Fatalf("get trip: %v", err)
	}
	if got.Title != "Test Trip" {
		t.Errorf("expected title %q, got %q", "Test Trip", got.Title)
	}
}
