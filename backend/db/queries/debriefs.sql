-- name: UpsertDebrief :one
INSERT INTO debriefs (trip_id, summary, decision_reflections, lessons_learned)
VALUES ($1, $2, $3, $4)
ON CONFLICT (trip_id) DO UPDATE SET
    summary = EXCLUDED.summary,
    decision_reflections = EXCLUDED.decision_reflections,
    lessons_learned = EXCLUDED.lessons_learned,
    updated_at = now()
RETURNING *;

-- name: GetDebriefByTrip :one
SELECT * FROM debriefs WHERE trip_id = $1;

-- name: SubmitDebrief :one
UPDATE debriefs SET submitted_at = now()
WHERE trip_id = $1
RETURNING *;
