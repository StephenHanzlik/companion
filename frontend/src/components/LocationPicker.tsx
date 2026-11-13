import { useState } from 'react'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Same icon fix as the Weather page: point Leaflet at Vite's bundled marker images.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// Roughly Berthoud Pass, CO.
const DEFAULT_CENTER: [number, number] = [39.7975, -105.7756]

export interface PlaceValue {
  name: string
  lat: number | null
  lon: number | null
}

function ClickHandler({ onPick }: { onPick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function LocationPicker({
  value,
  onChange,
}: {
  value: PlaceValue
  onChange: (next: PlaceValue) => void
}) {
  const [geoError, setGeoError] = useState<string | null>(null)
  const hasPoint = value.lat !== null && value.lon !== null
  const center: [number, number] = hasPoint ? [value.lat as number, value.lon as number] : DEFAULT_CENTER

  function setPoint(lat: number, lon: number) {
    onChange({ ...value, lat, lon })
  }

  function useMyLocation() {
    setGeoError(null)
    if (!navigator.geolocation) {
      setGeoError('This browser cannot get your location.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setPoint(pos.coords.latitude, pos.coords.longitude),
      () => setGeoError('Could not get your location. Tap the map instead.'),
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }

  return (
    <div className="location-picker">
      <div className="field">
        <label>Location</label>
        <input
          value={value.name}
          placeholder="e.g. Treeline bowl below the ridge"
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
      </div>

      <div className="location-picker-map">
        <MapContainer key={hasPoint ? 'pt' : 'none'} center={center} zoom={hasPoint ? 13 : 9} className="map-box">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={setPoint} />
          {hasPoint && <Marker position={center} />}
        </MapContainer>
      </div>

      <div className="location-picker-actions">
        <button type="button" className="plan-add" onClick={useMyLocation}>
          Use my location
        </button>
        {hasPoint && (
          <button
            type="button"
            className="plan-link"
            onClick={() => onChange({ ...value, lat: null, lon: null })}
          >
            Clear point
          </button>
        )}
        <span className="muted">
          {hasPoint ? `${(value.lat as number).toFixed(5)}, ${(value.lon as number).toFixed(5)}` : 'Tap the map to set a point'}
        </span>
      </div>
      {geoError && <p className="plan-help">{geoError}</p>}
    </div>
  )
}
