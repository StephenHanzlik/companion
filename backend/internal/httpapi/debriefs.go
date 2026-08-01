package httpapi

import (
	"encoding/json"
	"net/http"

	"observer/internal/db"
)

type upsertDebriefRequest struct {
	Summary             *string         `json:"summary"`
	DecisionReflections json.RawMessage `json:"decision_reflections"`
	LessonsLearned      *string         `json:"lessons_learned"`
}

func (s *Server) getDebrief(w http.ResponseWriter, r *http.Request) {
	tripID, err := tripIDFromRequest(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid trip id")
		return
	}
	debrief, err := s.q.GetDebriefByTrip(r.Context(), tripID)
	if err != nil {
		writeError(w, http.StatusNotFound, "debrief not found")
		return
	}
	writeJSON(w, http.StatusOK, debrief)
}

func (s *Server) upsertDebrief(w http.ResponseWriter, r *http.Request) {
	tripID, err := tripIDFromRequest(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid trip id")
		return
	}
	var req upsertDebriefRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	debrief, err := s.q.UpsertDebrief(r.Context(), db.UpsertDebriefParams{
		TripID:              tripID,
		Summary:             req.Summary,
		DecisionReflections: defaultJSON(req.DecisionReflections, "[]"),
		LessonsLearned:      req.LessonsLearned,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save debrief")
		return
	}
	writeJSON(w, http.StatusOK, debrief)
}

func (s *Server) submitDebrief(w http.ResponseWriter, r *http.Request) {
	tripID, err := tripIDFromRequest(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid trip id")
		return
	}
	debrief, err := s.q.SubmitDebrief(r.Context(), tripID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to submit debrief")
		return
	}
	writeJSON(w, http.StatusOK, debrief)
}
