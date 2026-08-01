import { FormEvent, useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Trip } from '../api/types'

export default function TripsList({ onSelectTrip }: { onSelectTrip: (tripId: string) => void }) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [zone, setZone] = useState('')

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
    if (!title.trim()) return
    try {
      await api.createTrip({ title, zone: zone || undefined })
      setTitle('')
      setZone('')
      reload()
    } catch (e) {
      setError(String(e))
    }
  }

  return (
    <div>
      <div className="card">
        <h2>New trip</h2>
        <form onSubmit={handleCreate}>
          <div className="field">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Northwest Couloirs" />
          </div>
          <div className="field">
            <label>Zone</label>
            <input value={zone} onChange={(e) => setZone(e.target.value)} placeholder="e.g. Wasatch Central" />
          </div>
          <button className="primary" type="submit">
            Create trip
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Trips</h2>
        {loading && <p className="muted">Loading…</p>}
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        {!loading && trips.length === 0 && <p className="muted">No trips yet.</p>}
        {trips.map((trip) => (
          <div key={trip.id} className="list-item">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <strong>{trip.title}</strong>{' '}
                <span className="muted">
                  {trip.zone ?? 'no zone set'} · {trip.status}
                </span>
              </div>
              <button className="primary" onClick={() => onSelectTrip(trip.id)}>
                Open
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
