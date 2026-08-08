package httpapi

import (
	"errors"
	"net/http"
	"strconv"

	"companion/internal/weather"
)

func (s *Server) getWeather(w http.ResponseWriter, r *http.Request) {
	lat, err := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid or missing lat")
		return
	}
	lon, err := strconv.ParseFloat(r.URL.Query().Get("lon"), 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid or missing lon")
		return
	}

	summary, err := s.weather.PointSummary(r.Context(), lat, lon)
	if errors.Is(err, weather.ErrNoCoverage) {
		writeError(w, http.StatusUnprocessableEntity, "no NWS forecast coverage for this location (US only)")
		return
	}
	if err != nil {
		writeError(w, http.StatusBadGateway, "failed to fetch weather.gov data")
		return
	}
	writeJSON(w, http.StatusOK, summary)
}
