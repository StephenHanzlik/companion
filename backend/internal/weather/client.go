// Package weather combines two free, keyless US government APIs:
//   - api.weather.gov (NWS) for forecast + current conditions.
//   - USGS's Elevation Point Query Service for terrain elevation.
//
// Elevation deliberately does NOT come from NWS's observation stations:
// those are ranked by lat/lon proximity, not elevation, and cluster at
// airports -- in mountain terrain the "nearest" station is often a valley
// airport miles away and thousands of feet off. USGS EPQS answers the exact
// clicked point from a real DEM instead.
package weather

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"
	"sync"
	"time"
)

var ErrNoCoverage = errors.New("no NWS forecast coverage for this location")

type Client struct {
	httpClient *http.Client
	userAgent  string
}

func NewClient(userAgent string) *Client {
	return &Client{
		httpClient: &http.Client{Timeout: 10 * time.Second},
		userAgent:  userAgent,
	}
}

func (c *Client) get(ctx context.Context, url string, out any) (int, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return 0, err
	}
	req.Header.Set("User-Agent", c.userAgent)
	req.Header.Set("Accept", "application/geo+json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return resp.StatusCode, nil
	}
	return resp.StatusCode, json.NewDecoder(resp.Body).Decode(out)
}

func haversineMiles(lat1, lon1, lat2, lon2 float64) float64 {
	const earthRadiusMiles = 3958.8
	toRad := func(deg float64) float64 { return deg * math.Pi / 180 }
	dLat := toRad(lat2 - lat1)
	dLon := toRad(lon2 - lon1)
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(toRad(lat1))*math.Cos(toRad(lat2))*math.Sin(dLon/2)*math.Sin(dLon/2)
	return earthRadiusMiles * 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
}

type quantity struct {
	Value *float64 `json:"value"`
}

type pointsResponse struct {
	Properties struct {
		Forecast            string `json:"forecast"`
		ObservationStations string `json:"observationStations"`
		RelativeLocation    struct {
			Properties struct {
				City  string `json:"city"`
				State string `json:"state"`
			} `json:"properties"`
		} `json:"relativeLocation"`
	} `json:"properties"`
}

type nwsForecastPeriod struct {
	Name            string `json:"name"`
	Temperature     int    `json:"temperature"`
	TemperatureUnit string `json:"temperatureUnit"`
	WindSpeed       string `json:"windSpeed"`
	WindDirection   string `json:"windDirection"`
	ShortForecast   string `json:"shortForecast"`
}

type forecastResponse struct {
	Properties struct {
		Periods []nwsForecastPeriod `json:"periods"`
	} `json:"properties"`
}

type stationsResponse struct {
	Features []struct {
		Geometry struct {
			// GeoJSON order: [lon, lat].
			Coordinates []float64 `json:"coordinates"`
		} `json:"geometry"`
		Properties struct {
			StationIdentifier string `json:"stationIdentifier"`
		} `json:"properties"`
	} `json:"features"`
}

type observationResponse struct {
	Properties struct {
		Timestamp        string   `json:"timestamp"`
		TextDescription  string   `json:"textDescription"`
		Temperature      quantity `json:"temperature"`
		WindSpeed        quantity `json:"windSpeed"`
		RelativeHumidity quantity `json:"relativeHumidity"`
	} `json:"properties"`
}

type usgsElevationResponse struct {
	Value float64 `json:"value"`
}

type ForecastPeriod struct {
	Name            string `json:"name"`
	Temperature     int    `json:"temperature"`
	TemperatureUnit string `json:"temperature_unit"`
	WindSpeed       string `json:"wind_speed"`
	WindDirection   string `json:"wind_direction"`
	ShortForecast   string `json:"short_forecast"`
}

type PointSummary struct {
	City                string           `json:"city"`
	State               string           `json:"state"`
	ElevationMeters     *float64         `json:"elevation_m"`
	ElevationFeet       *float64         `json:"elevation_ft"`
	ElevationSource     string           `json:"elevation_source"` // "usgs" or "station" (fallback)
	StationID           string           `json:"station_id"`
	StationDistanceMi   *float64         `json:"station_distance_mi"`
	ObservedAt          string           `json:"observed_at"`
	Conditions          string           `json:"conditions"`
	TempC               *float64         `json:"temp_c"`
	TempF               *float64         `json:"temp_f"`
	WindKph             *float64         `json:"wind_kph"`
	RelativeHumidityPct *float64         `json:"relative_humidity_pct"`
	Forecast            []ForecastPeriod `json:"forecast"`
}

func feetToMeters(ft float64) float64       { return ft / 3.28084 }
func celsiusToFahrenheit(c float64) float64 { return c*9/5 + 32 }

// usgsElevationFeet queries USGS's National Map Elevation Point Query
// Service for the terrain elevation at the exact (lat, lon), independent of
// any weather station.
func (c *Client) usgsElevationFeet(ctx context.Context, lat, lon float64) (*float64, error) {
	url := fmt.Sprintf(
		"https://epqs.nationalmap.gov/v1/json?x=%.6f&y=%.6f&units=Feet&wkid=4326&includeDate=false",
		lon, lat,
	)
	var resp usgsElevationResponse
	status, err := c.get(ctx, url, &resp)
	if err != nil {
		return nil, err
	}
	if status != http.StatusOK {
		return nil, fmt.Errorf("usgs epqs: unexpected status %d", status)
	}
	return &resp.Value, nil
}

// PointSummary looks up the NWS grid point for (lat, lon), then fetches its
// forecast, the latest observation from the nearest station, and (via USGS,
// concurrently) the actual terrain elevation at that point.
func (c *Client) PointSummary(ctx context.Context, lat, lon float64) (*PointSummary, error) {
	var (
		usgsElevationFt *float64
		wg              sync.WaitGroup
	)
	wg.Add(1)
	go func() {
		defer wg.Done()
		if ft, err := c.usgsElevationFeet(ctx, lat, lon); err == nil {
			usgsElevationFt = ft
		}
	}()

	pointsURL := fmt.Sprintf("https://api.weather.gov/points/%.4f,%.4f", lat, lon)
	var points pointsResponse
	status, err := c.get(ctx, pointsURL, &points)
	if err != nil {
		wg.Wait()
		return nil, fmt.Errorf("points lookup: %w", err)
	}
	if status == http.StatusNotFound {
		wg.Wait()
		return nil, ErrNoCoverage
	}
	if status != http.StatusOK {
		wg.Wait()
		return nil, fmt.Errorf("points lookup: unexpected status %d", status)
	}

	summary := &PointSummary{
		City:  points.Properties.RelativeLocation.Properties.City,
		State: points.Properties.RelativeLocation.Properties.State,
	}

	if points.Properties.Forecast != "" {
		var forecast forecastResponse
		if status, err := c.get(ctx, points.Properties.Forecast, &forecast); err == nil && status == http.StatusOK {
			periods := forecast.Properties.Periods
			if len(periods) > 4 {
				periods = periods[:4]
			}
			for _, p := range periods {
				summary.Forecast = append(summary.Forecast, ForecastPeriod{
					Name:            p.Name,
					Temperature:     p.Temperature,
					TemperatureUnit: p.TemperatureUnit,
					WindSpeed:       p.WindSpeed,
					WindDirection:   p.WindDirection,
					ShortForecast:   p.ShortForecast,
				})
			}
		}
	}

	if points.Properties.ObservationStations != "" {
		var stations stationsResponse
		if status, err := c.get(ctx, points.Properties.ObservationStations, &stations); err == nil && status == http.StatusOK && len(stations.Features) > 0 {
			station := stations.Features[0]
			stationID := station.Properties.StationIdentifier
			summary.StationID = stationID

			if len(station.Geometry.Coordinates) == 2 {
				stationLon, stationLat := station.Geometry.Coordinates[0], station.Geometry.Coordinates[1]
				d := haversineMiles(lat, lon, stationLat, stationLon)
				summary.StationDistanceMi = &d
			}

			obsURL := fmt.Sprintf("https://api.weather.gov/stations/%s/observations/latest", stationID)
			var obs observationResponse
			if status, err := c.get(ctx, obsURL, &obs); err == nil && status == http.StatusOK {
				summary.ObservedAt = obs.Properties.Timestamp
				summary.Conditions = obs.Properties.TextDescription
				summary.WindKph = obs.Properties.WindSpeed.Value
				summary.RelativeHumidityPct = obs.Properties.RelativeHumidity.Value

				if v := obs.Properties.Temperature.Value; v != nil {
					summary.TempC = v
					f := celsiusToFahrenheit(*v)
					summary.TempF = &f
				}
			}
		}
	}

	wg.Wait()
	if usgsElevationFt != nil {
		summary.ElevationFeet = usgsElevationFt
		m := feetToMeters(*usgsElevationFt)
		summary.ElevationMeters = &m
		summary.ElevationSource = "usgs"
	}

	return summary, nil
}
