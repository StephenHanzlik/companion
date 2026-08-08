package httpapi

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"companion/internal/db"
	"companion/internal/weather"
)

type Server struct {
	q       *db.Queries
	weather *weather.Client
}

func NewRouter(q *db.Queries, weatherClient *weather.Client) http.Handler {
	s := &Server{q: q, weather: weatherClient}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(corsMiddleware)

	r.Get("/healthz", s.healthz)
	r.Get("/api/weather", s.getWeather)

	r.Route("/api/trips", func(r chi.Router) {
		r.Post("/", s.createTrip)
		r.Get("/", s.listTrips)

		r.Route("/{tripID}", func(r chi.Router) {
			r.Get("/", s.getTrip)
			r.Patch("/status", s.updateTripStatus)

			r.Get("/plan", s.getPlan)
			r.Put("/plan", s.upsertPlan)
			r.Post("/plan/sign-off", s.signOffPlan)

			r.Get("/observations", s.listObservations)
			r.Post("/observations", s.createObservation)

			r.Get("/snow-tests", s.listSnowProfileTests)
			r.Post("/snow-tests", s.createSnowProfileTest)

			r.Get("/debrief", s.getDebrief)
			r.Put("/debrief", s.upsertDebrief)
			r.Post("/debrief/submit", s.submitDebrief)
		})
	})

	return r
}

func (s *Server) healthz(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
