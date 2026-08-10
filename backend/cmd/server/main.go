package main

import (
	"context"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"companion/internal/config"
	"companion/internal/db"
	"companion/internal/httpapi"
	"companion/internal/weather"
)

func main() {
	cfg := config.Load()
	log.Printf("startup: port=%q database_url_len=%d weather_user_agent_len=%d", cfg.Port, len(cfg.DatabaseURL), len(cfg.WeatherUserAgent))

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect to database: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("ping database: %v", err)
	}
	log.Println("startup: database ping ok")

	queries := db.New(pool)
	weatherClient := weather.NewClient(cfg.WeatherUserAgent)
	router := httpapi.NewRouter(queries, weatherClient)

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	go func() {
		log.Printf("companion backend listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	<-ctx.Done()
	log.Println("shutting down")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = srv.Shutdown(shutdownCtx)
}
