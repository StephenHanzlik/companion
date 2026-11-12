-- name: CreateTrip :one
INSERT INTO trips (owner_id, title, state, start_date, end_date)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: ListTrips :many
SELECT * FROM trips ORDER BY created_at DESC;

-- name: GetTrip :one
SELECT * FROM trips WHERE id = $1;

-- name: UpdateTripStatus :one
UPDATE trips SET status = $2, updated_at = now()
WHERE id = $1
RETURNING *;
