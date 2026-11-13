import type { ReactNode } from 'react'
import type { Trip, TripStatus } from '../api/types'
import { stateName } from '../api/states'
import { formatDateRange } from '../api/format'
import { PHASES, Phase, phaseOf } from '../api/records'
import Icon from '../components/Icon'
import PlanTab from './PlanTab'
import RideTab from './RideTab'
import DebriefTab from './DebriefTab'

export interface PhaseProps {
  trip: Trip
  sheet: string
  header: ReactNode
  onStatusChange: (status: TripStatus) => Promise<void>
  onGoTo: (phase: Phase) => void
}

// Header and work on the left, the overview card on the right. On narrow
// screens the overview drops between the header and the work.
export function PhaseFrame({ header, aside, children }: { header: ReactNode; aside: ReactNode; children: ReactNode }) {
  return (
    <div className="ws">
      <div className="ws-head">{header}</div>
      <div className="ws-main">{children}</div>
      <aside className="ws-aside">{aside}</aside>
    </div>
  )
}

export default function TripWorkspace({
  trip,
  sheet,
  tab,
  onTab,
  onStatusChange,
  onBack,
}: {
  trip: Trip
  sheet: string
  tab: Phase
  onTab: (tab: Phase) => void
  onStatusChange: (status: TripStatus) => Promise<void>
  onBack: () => void
}) {
  const current = phaseOf(trip.status)

  const header = (
    <header className="trip-head">
      <div className="trip-head-text">
        <button className="back-link" onClick={onBack}>
          <Icon name="arrow-left" size={14} />
          All trips
        </button>
        <h1>{trip.title}</h1>
        <p className="trip-meta">
          <span className="mono">Sheet {sheet}</span>
          <span aria-hidden="true">·</span>
          <span>{stateName(trip.state) ?? 'No state'}</span>
          <span aria-hidden="true">·</span>
          <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
        </p>
      </div>
      <div className="segmented" role="tablist" aria-label="Phase">
        {PHASES.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={tab === p.id}
            onClick={() => onTab(p.id)}
            title={p.id === current ? `${p.label}: where this trip is now` : undefined}
          >
            {p.label}
            {p.id === current && <span className="tab-now" aria-label="(current phase)" />}
          </button>
        ))}
      </div>
    </header>
  )

  const props: PhaseProps = { trip, sheet, header, onStatusChange, onGoTo: onTab }

  return (
    <>
      {tab === 'plan' && <PlanTab key={`plan-${trip.id}`} {...props} />}
      {tab === 'ride' && <RideTab key={`ride-${trip.id}`} {...props} />}
      {tab === 'debrief' && <DebriefTab key={`debrief-${trip.id}`} {...props} />}
    </>
  )
}
