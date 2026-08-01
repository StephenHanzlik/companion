-- name: CreateSnowProfileTest :one
INSERT INTO snow_profile_tests (trip_id, observation_id, created_by, test_type, recorded_at, latitude, longitude, elevation_m, aspect, slope_angle_deg, results, notes)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
RETURNING *;

-- name: ListSnowProfileTestsByTrip :many
SELECT * FROM snow_profile_tests WHERE trip_id = $1 ORDER BY recorded_at ASC;
