import { useState } from 'react'
import Landing from './pages/Landing'
import TripsList from './pages/TripsList'
import TripWorkspace from './pages/TripWorkspace'
import WeatherPoc from './pages/WeatherPoc'

type View = 'home' | 'trips' | 'weather'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)

  // On the home page the nav sits over the bottom of the hero photo;
  // everywhere else it sits at the top of the page.
  const nav = (
    <div className={`tabs app-nav${view === 'home' ? ' app-nav-overlay' : ''}`}>
      <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>
        Home
      </button>
      <button className={view === 'trips' ? 'active' : ''} onClick={() => setView('trips')}>
        Trips
      </button>
      <button className={view === 'weather' ? 'active' : ''} onClick={() => setView('weather')}>
        Weather POC
      </button>
    </div>
  )

  return (
    <>
      {view !== 'home' && nav}

      {view === 'home' && <Landing onGetStarted={() => setView('trips')} nav={nav} />}

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
