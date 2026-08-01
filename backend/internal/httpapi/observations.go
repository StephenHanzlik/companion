package httpapi

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgtype"

	"observer/internal/db"
)

var validObservationTypes = map[string]bool{
	"weather": true, "terrain": true, "avalanche": true, "red_flag": true, "general": true,
}

type createObservationRequest struct {
	CreatedBy       string          `json:"created_by"`
	ObservationType string          `json:"observation_type"`
	ObservedAt      *string         `json:"observed_at"` // RFC3339; defaults to now
	Latitude        *float64        `json:"latitude"`
	Longitude       *float64        `json:"longitude"`
	ElevationMeters *float64        `json:"elevation_m"`
	Notes           *string         `json:"notes"`
	Data            json.RawMessage `json:"data"`
}

func (s *Server) listObservations(w http.ResponseWriter, r *http.Request) {
	tripID, err := tripIDFromRequest(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid trip id")
		return
	}
	observations, err := s.q.ListObservationsByTrip(r.Context(), tripID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list observations")
		return
	}
	if observations == nil {
		observations = []db.Observation{}
	}
	writeJSON(w, http.StatusOK, observations)
}

func (s *Server) createObservation(w http.ResponseWriter, r *http.Request) {
	tripID, err := tripIDFromRequest(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid trip id")
		return
	}
	var req createObservationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if !validObservationTypes[req.ObservationType] {
		writeError(w, http.StatusBadRequest, "invalid observation_type")
		return
	}
	createdBy, err := parseUUIDField(req.CreatedBy)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid created_by")
		return
	}

	observedAt := time.Now().UTC()
	if req.ObservedAt != nil && *req.ObservedAt != "" {
		t, err := time.Parse(time.RFC3339, *req.ObservedAt)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid observed_at")
			return
		}
		observedAt = t
	}

	observation, err := s.q.CreateObservation(r.Context(), db.CreateObservationParams{
		TripID:          tripID,
		CreatedBy:       createdBy,
		ObservationType: db.ObservationType(req.ObservationType),
		ObservedAt:      pgtype.Timestamptz{Time: observedAt, Valid: true},
		Latitude:        req.Latitude,
		Longitude:       req.Longitude,
		ElevationM:      req.ElevationMeters,
		Notes:           req.Notes,
		Data:            defaultJSON(req.Data, "{}"),
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create observation")
		return
	}
	writeJSON(w, http.StatusCreated, observation)
}
