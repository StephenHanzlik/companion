import type { TripStatus } from '../api/types'
import { phaseLabel } from '../api/records'

// Small shape that marks a trip's phase: square for Plan, dot for Ride,
// diamond once debriefed. Shape carries the state, colour reinforces it.
export default function StatusMark({ status, withLabel = false }: { status: TripStatus | string; withLabel?: boolean }) {
  const cls = status === 'active' ? 'ride' : status === 'debriefed' ? 'done' : 'plan'
  return (
    <span className="status">
      <i className={`status-mark status-${cls}`} aria-hidden="true" />
      {withLabel ? <span>{phaseLabel(status)}</span> : <span className="sr-only">{phaseLabel(status)}</span>}
    </span>
  )
}
