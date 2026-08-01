import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Trip } from '../api/types'
import PlanTab from './PlanTab'
import RideTab from './RideTab'
import DebriefTab from './DebriefTab'

type Tab = 'plan' | 'ride' | 'debrief'

export default function TripWorkspace({ tripId, onBack }: { tripId: string; onBack: () => void }) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [tab, setTab] = useState<Tab>('plan')

  useEffect(() => {
    api.getTrip(tripId).then(setTrip).catch(() => setTrip(null))
  }, [tripId])

  return (
    <div>
      <button className="back-link" onClick={onBack}>
        ← Back to trips
      </button>

      <div className="card">
        <h2>{trip?.title ?? 'Loading…'}</h2>
        <p className="muted">
          {trip?.zone ?? 'no zone'} · status: {trip?.status}
        </p>
      </div>

      <div className="tabs">
        <button className={tab === 'plan' ? 'active' : ''} onClick={() => setTab('plan')}>
          Plan
        </button>
        <button className={tab === 'ride' ? 'active' : ''} onClick={() => setTab('ride')}>
          Ride
        </button>
        <button className={tab === 'debrief' ? 'active' : ''} onClick={() => setTab('debrief')}>
          Debrief
        </button>
      </div>

      {tab === 'plan' && <PlanTab tripId={tripId} />}
      {tab === 'ride' && <RideTab tripId={tripId} />}
      {tab === 'debrief' && <DebriefTab tripId={tripId} />}
    </div>
  )
}
