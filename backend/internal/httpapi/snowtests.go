package httpapi

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgtype"

	"observer/internal/db"
)

var validSnowTestTypes = map[string]bool{
	"compression_test": true, "extended_column_test": true, "propagation_saw_test": true,
	"pit_profile": true, "other": true,
}

type createSnowProfileTestRequest struct {
	ObservationID *string         `json:"observation_id"`
	CreatedBy     string          `json:"created_by"`
	TestType      string          `json:"test_type"`
	RecordedAt    *string         `json:"recorded_at"` // RFC3339; defaults to now
	Latitude      *float64        `json:"latitude"`
	Longitude     *float64        `json:"longitude"`
	ElevationM    *float64        `json:"elevation_m"`
	Aspect        *string         `json:"aspect"`
	SlopeAngleDeg *float64        `json:"slope_angle_deg"`
	Results       json.RawMessage `json:"results"`
	Notes         *string         `json:"notes"`
}

func (s *Server) listSnowProfileTests(w http.ResponseWriter, r *http.Request) {
	tripID, err := tripIDFromRequest(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid trip id")
		return
	}
	tests, err := s.q.ListSnowProfileTestsByTrip(r.Context(), tripID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list snow profile tests")
		return
	}
	if tests == nil {
		tests = []db.SnowProfileTest{}
	}
	writeJSON(w, http.StatusOK, tests)
}

func (s *Server) createSnowProfileTest(w http.ResponseWriter, r *http.Request) {
	tripID, err := tripIDFromRequest(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid trip id")
		return
	}
	var req createSnowProfileTestRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if !validSnowTestTypes[req.TestType] {
		writeError(w, http.StatusBadRequest, "invalid test_type")
		return
	}
	createdBy, err := parseUUIDField(req.CreatedBy)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid created_by")
		return
	}

	var observationID pgtype.UUID
	if req.ObservationID != nil && *req.ObservationID != "" {
		id, err := parseUUIDField(*req.ObservationID)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid observation_id")
			return
		}
		observationID = pgtype.UUID{Bytes: [16]byte(id), Valid: true}
	}

	recordedAt := time.Now().UTC()
	if req.RecordedAt != nil && *req.RecordedAt != "" {
		t, err := time.Parse(time.RFC3339, *req.RecordedAt)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid recorded_at")
			return
		}
		recordedAt = t
	}

	test, err := s.q.CreateSnowProfileTest(r.Context(), db.CreateSnowProfileTestParams{
		TripID:        tripID,
		ObservationID: observationID,
		CreatedBy:     createdBy,
		TestType:      db.SnowTestType(req.TestType),
		RecordedAt:    pgtype.Timestamptz{Time: recordedAt, Valid: true},
		Latitude:      req.Latitude,
		Longitude:     req.Longitude,
		ElevationM:    req.ElevationM,
		Aspect:        req.Aspect,
		SlopeAngleDeg: req.SlopeAngleDeg,
		Results:       defaultJSON(req.Results, "{}"),
		Notes:         req.Notes,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create snow profile test")
		return
	}
	writeJSON(w, http.StatusCreated, test)
}
