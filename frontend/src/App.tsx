import { useState } from 'react'
import TripsList from './pages/TripsList'
import TripWorkspace from './pages/TripWorkspace'
import WeatherPoc from './pages/WeatherPoc'

type View = 'trips' | 'weather'

export default function App() {
  const [view, setView] = useState<View>('trips')
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)

  return (
    <>
      <h1>Observer</h1>
      <p className="muted">Backcountry trip companion — Plan, Ride, Debrief.</p>

      <div className="tabs">
        <button className={view === 'trips' ? 'active' : ''} onClick={() => setView('trips')}>
          Trips
        </button>
        <button className={view === 'weather' ? 'active' : ''} onClick={() => setView('weather')}>
          Weather POC
        </button>
      </div>

      {view === 'trips' &&
        (selectedTripId ? (
          <TripWorkspace tripId={selectedTripId} onBack={() => setSelectedTripId(null)} />
        ) : (
          <TripsList onSelectTrip={setSelectedTripId} />
        ))}

      {view === 'weather' && <WeatherPoc />}
    </>
  )
}
