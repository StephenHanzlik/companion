import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Trip } from '../api/types'
import { stateName } from '../api/states'
import { formatDateRange } from '../api/format'
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

      <div className="card trip-banner">
        <div className="trip-banner-main">
          <h2>{trip?.title ?? 'Loading…'}</h2>
          {trip && (
            <div className="trip-banner-meta">
              <span>{stateName(trip.state) ?? 'No state'}</span>
              <span className="trip-banner-sep" aria-hidden="true">·</span>
              <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
            </div>
          )}
        </div>
        {trip && <span className={`status-pill status-${trip.status}`}>{trip.status}</span>}
      </div>

      <div className="tabs phase-tabs">
        <button className={tab === 'plan' ? 'active' : ''} onClick={() => setTab('plan')}>
          Plan
        </button>
        <span className="phase-arrow" aria-hidden="true">→</span>
        <button className={tab === 'ride' ? 'active' : ''} onClick={() => setTab('ride')}>
          Ride
        </button>
        <span className="phase-arrow" aria-hidden="true">→</span>
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
