import { useState } from 'react'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { api } from '../api/client'
import type { WeatherSummary } from '../api/types'

// Vite bundles Leaflet's marker images under hashed URLs; Leaflet's default
// icon setup assumes classic script-tag paths, so point it at the bundled
// URLs directly instead.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// Roughly Berthoud Pass, CO -- solid NWS coverage, backcountry-relevant.
const DEFAULT_CENTER: [number, number] = [39.7975, -105.7756]

function ClickHandler({ onSelect }: { onSelect: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function WeatherPoc() {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [weather, setWeather] = useState<WeatherSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSelect(lat: number, lon: number) {
    setPosition([lat, lon])
    setWeather(null)
    setError(null)
    setLoading(true)
    try {
      const data = await api.getWeather(lat, lon)
      setWeather(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="muted">
        NWS (api.weather.gov) point lookup POC — US coverage only, nothing here is persisted. Click the map
        to select a point.
      </p>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <MapContainer center={DEFAULT_CENTER} zoom={9} style={{ height: 420, width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onSelect={handleSelect} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>

      <div className="card">
        <h3>Point data</h3>
        {!position && <p className="muted">No point selected yet.</p>}
        {position && (
          <p className="muted">
            {position[0].toFixed(4)}, {position[1].toFixed(4)}
          </p>
        )}
        {loading && <p className="muted">Fetching weather.gov data…</p>}
        {error && <p style={{ color: 'crimson' }}>{error}</p>}

        {weather && (
          <div>
            <p>
              <strong>
                {weather.city || 'Unknown location'}
                {weather.state ? `, ${weather.state}` : ''}
              </strong>
            </p>
            {weather.elevation_ft != null && (
              <p>
                Elevation: {Math.round(weather.elevation_ft)} ft ({Math.round(weather.elevation_m ?? 0)} m){' '}
                <span className="muted">
                  ({weather.elevation_source === 'usgs' ? 'USGS terrain data at this point' : 'estimated'})
                </span>
              </p>
            )}
            {weather.temp_f != null && (
              <p>
                Current: {Math.round(weather.temp_f)}°F ({weather.temp_c?.toFixed(1)}°C)
                {weather.conditions ? ` — ${weather.conditions}` : ''}
              </p>
            )}
            {weather.wind_kph != null && <p>Wind: {weather.wind_kph.toFixed(1)} km/h</p>}
            {weather.relative_humidity_pct != null && (
              <p>Humidity: {Math.round(weather.relative_humidity_pct)}%</p>
            )}
            {weather.station_id && (
              <p className="muted">
                Nearest station: {weather.station_id}
                {weather.station_distance_mi != null && ` (${weather.station_distance_mi.toFixed(1)} mi away)`}
                {weather.observed_at && ` · observed ${new Date(weather.observed_at).toLocaleString()}`}
              </p>
            )}

            {weather.forecast.length > 0 && (
              <div>
                <h4>Forecast</h4>
                {weather.forecast.map((p) => (
                  <div key={p.name} className="list-item">
                    <strong>{p.name}</strong>: {p.temperature}°{p.temperature_unit} — {p.short_forecast}
                    <div className="muted">
                      Wind {p.wind_speed} {p.wind_direction}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
