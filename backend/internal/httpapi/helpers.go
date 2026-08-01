package httpapi

import "github.com/google/uuid"

func parseUUIDField(raw string) (uuid.UUID, error) {
	return uuid.Parse(raw)
}
