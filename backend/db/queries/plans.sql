-- name: UpsertPlan :one
INSERT INTO plans (trip_id, objectives, route, avalanche_forecast, weather_forecast, hazards, checklist)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (trip_id) DO UPDATE SET
    objectives = EXCLUDED.objectives,
    route = EXCLUDED.route,
    avalanche_forecast = EXCLUDED.avalanche_forecast,
    weather_forecast = EXCLUDED.weather_forecast,
    hazards = EXCLUDED.hazards,
    checklist = EXCLUDED.checklist,
    updated_at = now()
RETURNING *;

-- name: GetPlanByTrip :one
SELECT * FROM plans WHERE trip_id = $1;

-- name: SignOffPlan :one
UPDATE plans SET signed_off_at = now()
WHERE trip_id = $1
RETURNING *;
