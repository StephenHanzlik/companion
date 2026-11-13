import { useEffect, useState } from 'react'
import { USING_MOCK_API } from './api/client'
import { Route, navigate, parseRoute } from './api/route'
import Landing from './pages/Landing'
import TripsPage from './pages/TripsPage'
import WeatherPoc from './pages/WeatherPoc'
import TopBar, { View } from './components/TopBar'

// `?capture` hides the mock banner, for product screenshots taken in mock mode.
const SHOW_MOCK_BANNER = USING_MOCK_API && !new URLSearchParams(window.location.search).has('capture')

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash))

  useEffect(() => {
    const onChange = () => {
      const next = parseRoute(window.location.hash)
      setRoute((prev) => {
        // Moving between screens starts at the top; switching tabs within a
        // trip keeps the scroll position.
        const sameTrip =
          prev.view === 'trips' && next.view === 'trips' && prev.sub.kind === 'trip' && next.sub.kind === 'trip' && prev.sub.id === next.sub.id
        if (!sameTrip) window.scrollTo({ top: 0 })
        return next
      })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const go = (v: View) => navigate(v === 'trips' ? { view: 'trips', sub: { kind: 'home' } } : { view: v })

  return (
    <div className={`app app-${route.view}`}>
      <TopBar view={route.view} onNavigate={go} />
      {SHOW_MOCK_BANNER && (
        <p className="mock-banner" role="status">
          Mock data: sample trips stored in this browser, not the API.
        </p>
      )}

      {route.view === 'home' && <Landing onStartTrip={() => navigate({ view: 'trips', sub: { kind: 'new' } })} />}

      {route.view === 'trips' && (
        <TripsPage route={route.sub} onNavigate={(sub, opts) => navigate({ view: 'trips', sub }, opts)} />
      )}

      {route.view === 'weather' && (
        <div className="page">
          <h1 className="page-title">Weather</h1>
          <WeatherPoc />
        </div>
      )}
    </div>
  )
}
