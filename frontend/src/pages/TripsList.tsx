import { FormEvent, useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Trip } from '../api/types'
import { US_STATES, stateName } from '../api/states'
import { formatDate } from '../api/format'
import TripProgress from '../components/TripProgress'


export default function TripsList({ onSelectTrip }: { onSelectTrip: (tripId: string) => void }) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [state, setState] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Dates are optional, but an end date can't come before the start date.
  const datesValid = !startDate || !endDate || endDate >= startDate

  function reload() {
    setLoading(true)
    api
      .listTrips()
      .then((t) => setTrips(t ?? []))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }

  useEffect(reload, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !state || !datesValid) return
    try {
      await api.createTrip({
        title,
        state,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      setTitle('')
      setState('')
      setStartDate('')
      setEndDate('')
      reload()
    } catch (e) {
      setError(String(e))
    }
  }

  return (
    <div className="trips-layout">
      <div className="card trips-form-card">
        <h2>Create a new trip</h2>
        <form onSubmit={handleCreate}>
          <div className="field">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name your trip" />
          </div>
          <div className="field">
            <label>State</label>
            <select value={state} onChange={(e) => setState(e.target.value)} required>
              <option value="">Select a state…</option>
              {US_STATES.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Start date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="field">
            <label>End date</label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
            />
            {!datesValid && <p style={{ color: 'crimson', margin: '0.25rem 0 0' }}>End date can't be before start date.</p>}
          </div>
          <button className="primary" type="submit" disabled={!title.trim() || !state || !datesValid}>
            Create trip
          </button>
        </form>
      </div>

      <div className="card trips-table-card">
        <h2>Trips</h2>
        {loading && <p className="muted">Loading…</p>}
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        {!loading && trips.length === 0 && <p className="muted">No trips yet.</p>}
        {trips.length > 0 && (
          <div className="table-scroll">
            <table className="trips-table">
              <thead>
                <tr>
                  <th>Trip</th>
                  <th>State</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.id}>
                    <td className="trip-title">{trip.title}</td>
                    <td>{stateName(trip.state) ?? '—'}</td>
                    <td>{formatDate(trip.start_date)}</td>
                    <td>{formatDate(trip.end_date)}</td>
                    <td>
                      <TripProgress status={trip.status} variant="compact" />
                    </td>
                    <td className="trip-actions">
                      <button className="primary" onClick={() => onSelectTrip(trip.id)}>
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
