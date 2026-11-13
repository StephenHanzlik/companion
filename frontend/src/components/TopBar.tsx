import Icon from './Icon'

export type View = 'home' | 'trips' | 'weather'

export default function TopBar({ view, onNavigate }: { view: View; onNavigate: (v: View) => void }) {
  return (
    <header className="topbar">
      <button className="wordmark" onClick={() => onNavigate('home')} aria-label="Companion home">
        <Icon name="mark" size={20} />
        <span>
          Companion<span className="wordmark-dot">.</span>
        </span>
      </button>

      {view === 'home' ? (
        <nav className="topbar-nav topbar-nav-end" aria-label="Main">
          <a href="#how-it-works" className="topbar-link hide-narrow">
            How it works
          </a>
          <button className="topbar-link hide-narrow" onClick={() => onNavigate('weather')}>
            Weather
          </button>
          <button className="btn btn-accent btn-sm" onClick={() => onNavigate('trips')}>
            Open trips
          </button>
        </nav>
      ) : (
        <nav className="topbar-nav" aria-label="Main">
          <button className="topbar-link" aria-current={view === 'trips' ? 'page' : undefined} onClick={() => onNavigate('trips')}>
            Trips
          </button>
          <button className="topbar-link" aria-current={view === 'weather' ? 'page' : undefined} onClick={() => onNavigate('weather')}>
            Weather
          </button>
        </nav>
      )}
    </header>
  )
}
