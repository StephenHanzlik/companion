package httpapi

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"companion/internal/db"
)

func tripIDFromRequest(r *http.Request) (uuid.UUID, error) {
	return uuid.Parse(chi.URLParam(r, "tripID"))
}

type createTripRequest struct {
	OwnerID   string  `json:"owner_id"`
	Title     string  `json:"title"`
	State     string  `json:"state"` // two-letter US state code, e.g. "CO"
	StartDate *string `json:"start_date"` // YYYY-MM-DD
	EndDate   *string `json:"end_date"`   // YYYY-MM-DD
}

func parseDate(s *string) (pgtype.Date, error) {
	if s == nil || *s == "" {
		return pgtype.Date{}, nil
	}
	t, err := time.Parse("2006-01-02", *s)
	if err != nil {
		return pgtype.Date{}, err
	}
	return pgtype.Date{Time: t, Valid: true}, nil
}

func (s *Server) createTrip(w http.ResponseWriter, r *http.Request) {
	var req createTripRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Title == "" {
		writeError(w, http.StatusBadRequest, "title is required")
		return
	}
	if !usStates[req.State] {
		writeError(w, http.StatusBadRequest, "state must be a two-letter US state code")
		return
	}
	ownerID, err := uuid.Parse(req.OwnerID)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid owner_id")
		return
	}
	startDate, err := parseDate(req.StartDate)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid start_date")
		return
	}
	endDate, err := parseDate(req.EndDate)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid end_date")
		return
	}

	trip, err := s.q.CreateTrip(r.Context(), db.CreateTripParams{
		OwnerID:   ownerID,
		Title:     req.Title,
		State:     &req.State,
		StartDate: startDate,
		EndDate:   endDate,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create trip")
		return
	}
	writeJSON(w, http.StatusCreated, trip)
}

func (s *Server) listTrips(w http.ResponseWriter, r *http.Request) {
	trips, err := s.q.ListTrips(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list trips")
		return
	}
	if trips == nil {
		trips = []db.Trip{}
	}
	writeJSON(w, http.StatusOK, trips)
}

func (s *Server) getTrip(w http.ResponseWriter, r *http.Request) {
	id, err := tripIDFromRequest(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid trip id")
		return
	}
	trip, err := s.q.GetTrip(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "trip not found")
		return
	}
	writeJSON(w, http.StatusOK, trip)
}

type updateTripStatusRequest struct {
	Status string `json:"status"`
}

var validTripStatuses = map[string]bool{"planning": true, "active": true, "debriefed": true}

func (s *Server) updateTripStatus(w http.ResponseWriter, r *http.Request) {
	id, err := tripIDFromRequest(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid trip id")
		return
	}
	var req updateTripStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if !validTripStatuses[req.Status] {
		writeError(w, http.StatusBadRequest, "invalid status")
		return
	}

	trip, err := s.q.UpdateTripStatus(r.Context(), db.UpdateTripStatusParams{
		ID:     id,
		Status: db.TripStatus(req.Status),
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update trip status")
		return
	}
	writeJSON(w, http.StatusOK, trip)
}
