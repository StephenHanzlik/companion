import { useMemo, useState } from 'react'
import type { Trip } from '../api/types'
import { formatDate } from '../api/format'
import { isInProgress, phaseLabel } from '../api/records'
import { stateName } from '../api/states'
import Icon from './Icon'
import StatusMark from './StatusMark'

export default function TripRail({
  trips,
  sheets,
  selectedId,
  loading,
  onSelect,
  onHome,
  onNew,
}: {
  trips: Trip[]
  sheets: Map<string, string>
  selectedId: string | null
  loading: boolean
  onSelect: (id: string) => void
  onHome: () => void
  onNew: () => void
}) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return trips
    return trips.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.state ?? '').toLowerCase() === q ||
        (stateName(t.state) ?? '').toLowerCase().includes(q),
    )
  }, [trips, query])

  const groups = [
    { label: 'In progress', items: filtered.filter(isInProgress) },
    { label: 'Debriefed', items: filtered.filter((t) => !isInProgress(t)) },
  ]

  return (
    <nav className="rail" aria-label="Trips">
      <div className="rail-head">
        <button className="rail-title" onClick={onHome}>
          Trips
        </button>
        <button className="btn btn-primary btn-sm" onClick={onNew}>
          <Icon name="plus" size={14} />
          New trip
        </button>
      </div>
      <label className="rail-search">
        <Icon name="search" size={15} />
        <input
          type="search"
          placeholder="Search trips"
          aria-label="Search trips"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      {loading && (
        <div className="rail-skeleton" aria-label="Loading trips">
          <span />
          <span />
          <span />
        </div>
      )}

      {!loading && trips.length === 0 && <p className="rail-empty">No trips yet. Start one with New trip.</p>}
      {!loading && trips.length > 0 && filtered.length === 0 && (
        <p className="rail-empty">No trips match “{query.trim()}”.</p>
      )}

      {groups.map(
        (g) =>
          g.items.length > 0 && (
            <div key={g.label} className="rail-group">
              <h3 className="rail-group-label">{g.label}</h3>
              <ul>
                {g.items.map((t) => (
                  <li key={t.id}>
                    <button
                      className="rail-trip"
                      aria-current={t.id === selectedId ? 'true' : undefined}
                      onClick={() => onSelect(t.id)}
                    >
                      <span className="rail-trip-no">{sheets.get(t.id)}</span>
                      <span className="rail-trip-title">{t.title}</span>
                      <StatusMark status={t.status} />
                      <span className="rail-trip-meta">
                        {t.start_date ? formatDate(t.start_date) : 'No date'}
                        {isInProgress(t) && ` · ${phaseLabel(t.status)}`}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ),
      )}
    </nav>
  )
}
