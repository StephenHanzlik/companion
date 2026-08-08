package config

import "os"

type Config struct {
	Port             string
	DatabaseURL      string
	WeatherUserAgent string
}

func Load() Config {
	return Config{
		Port:        getEnv("PORT", "8080"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://companion:companion@localhost:5432/companion?sslmode=disable"),
		// api.weather.gov asks every client to identify itself; set
		// WEATHER_USER_AGENT to "your-app (contact@example.com)" per their guidelines.
		WeatherUserAgent: getEnv("WEATHER_USER_AGENT", "companion-poc (local dev, no contact set)"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
