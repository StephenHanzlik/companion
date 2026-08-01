-- name: CreateObservation :one
INSERT INTO observations (trip_id, created_by, observation_type, observed_at, latitude, longitude, elevation_m, notes, data)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

-- name: ListObservationsByTrip :many
SELECT * FROM observations WHERE trip_id = $1 ORDER BY observed_at ASC;

-- name: GetObservation :one
SELECT * FROM observations WHERE id = $1;
