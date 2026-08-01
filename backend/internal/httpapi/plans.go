package httpapi

import (
	"encoding/json"
	"net/http"

	"observer/internal/db"
)

type upsertPlanRequest struct {
	Objectives        *string         `json:"objectives"`
	Route             *string         `json:"route"`
	AvalancheForecast json.RawMessage `json:"avalanche_forecast"`
	WeatherForecast   json.RawMessage `json:"weather_forecast"`
	Hazards           json.RawMessage `json:"hazards"`
	Checklist         json.RawMessage `json:"checklist"`
}

func (s *Server) getPlan(w http.ResponseWriter, r *http.Request) {
	tripID, err := tripIDFromRequest(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid trip id")
		return
	}
	plan, err := s.q.GetPlanByTrip(r.Context(), tripID)
	if err != nil {
		writeError(w, http.StatusNotFound, "plan not found")
		return
	}
	writeJSON(w, http.StatusOK, plan)
}

func (s *Server) upsertPlan(w http.ResponseWriter, r *http.Request) {
	tripID, err := tripIDFromRequest(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid trip id")
		return
	}
	var req upsertPlanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	plan, err := s.q.UpsertPlan(r.Context(), db.UpsertPlanParams{
		TripID:            tripID,
		Objectives:        req.Objectives,
		Route:             req.Route,
		AvalancheForecast: defaultJSON(req.AvalancheForecast, "{}"),
		WeatherForecast:   defaultJSON(req.WeatherForecast, "{}"),
		Hazards:           defaultJSON(req.Hazards, "[]"),
		Checklist:         defaultJSON(req.Checklist, "[]"),
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save plan")
		return
	}
	writeJSON(w, http.StatusOK, plan)
}

func (s *Server) signOffPlan(w http.ResponseWriter, r *http.Request) {
	tripID, err := tripIDFromRequest(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid trip id")
		return
	}
	plan, err := s.q.SignOffPlan(r.Context(), tripID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to sign off plan")
		return
	}
	writeJSON(w, http.StatusOK, plan)
}
