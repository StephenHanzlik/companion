import { useId, useState } from 'react'
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

// A place name plus an optional point. The map stays folded until asked for,
// since most write-ups only need the name.
export default function LocationPicker({ value, onChange }: { value: PlaceValue; onChange: (next: PlaceValue) => void }) {
  const id = useId()
  const [geoError, setGeoError] = useState<string | null>(null)
  const hasPoint = value.lat !== null && value.lon !== null
  const [showMap, setShowMap] = useState(hasPoint)
  const center: [number, number] = hasPoint ? [value.lat as number, value.lon as number] : DEFAULT_CENTER

  function setPoint(lat: number, lon: number) {
    onChange({ ...value, lat, lon })
  }

  function useMyLocation() {
    setGeoError(null)
    setShowMap(true)
    if (!navigator.geolocation) {
      setGeoError('This browser can’t share its location. Click the map instead.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setPoint(pos.coords.latitude, pos.coords.longitude),
      () => setGeoError('Couldn’t get your location. Click the map instead.'),
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }

  return (
    <div className="field location">
      <label className="field-label" htmlFor={`${id}-name`}>
        Where
      </label>
      <input
        id={`${id}-name`}
        className="input"
        value={value.name}
        placeholder="e.g. Treeline bowl below the ridge"
        onChange={(e) => onChange({ ...value, name: e.target.value })}
      />
      <div className="location-actions">
        <button type="button" className="link-btn" aria-expanded={showMap} onClick={() => setShowMap((s) => !s)}>
          {showMap ? 'Hide map' : hasPoint ? 'Show point on map' : 'Add a point on the map'}
        </button>
        {showMap && (
          <button type="button" className="link-btn" onClick={useMyLocation}>
            Use my location
          </button>
        )}
        {hasPoint && (
          <>
            <span className="mono location-coords">
              {(value.lat as number).toFixed(4)}, {(value.lon as number).toFixed(4)}
            </span>
            <button type="button" className="link-btn" onClick={() => onChange({ ...value, lat: null, lon: null })}>
              Clear point
            </button>
          </>
        )}
      </div>
      {showMap && (
        <MapContainer key={hasPoint ? 'pt' : 'none'} center={center} zoom={hasPoint ? 13 : 9} className="map-box">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={setPoint} />
          {hasPoint && <Marker position={center} />}
        </MapContainer>
      )}
      {geoError && <p className="help">{geoError}</p>}
    </div>
  )
}
