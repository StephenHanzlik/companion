import type { TripStatus } from '../api/types'

// Trip status maps onto the three phases: Plan, Ride, Debrief.
export const STAGES: { status: TripStatus; label: string; phase: 'plan' | 'ride' | 'debrief' }[] = [
  { status: 'planning', label: 'Planning', phase: 'plan' },
  { status: 'active', label: 'Riding', phase: 'ride' },
  { status: 'debriefed', label: 'Debriefed', phase: 'debrief' },
]

export function stageIndex(status: TripStatus | string | null | undefined): number {
  const i = STAGES.findIndex((s) => s.status === status)
  return i < 0 ? 0 : i
}

// Shows where a trip is in its lifecycle. Stages before the current one are
// done, the current one is highlighted, and the rest are still ahead.
export default function TripProgress({
  status,
  variant = 'full',
}: {
  status: TripStatus | string | null | undefined
  variant?: 'full' | 'compact'
}) {
  const current = stageIndex(status)
  const label = STAGES[current].label

  return (
    <div className={`trip-progress trip-progress-${variant}`} aria-label={`Trip status: ${label}`}>
      {STAGES.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'ahead'
        return (
          <div key={s.status} className="tp-step-wrap">
            <div className={`tp-step tp-${state}`}>
              <span className="tp-dot" aria-hidden="true">
                {state === 'done' ? '✓' : i + 1}
              </span>
              {variant === 'full' && <span className="tp-label">{s.label}</span>}
            </div>
            {i < STAGES.length - 1 && <span className={`tp-line ${i < current ? 'tp-line-done' : ''}`} aria-hidden="true" />}
          </div>
        )
      })}
      {variant === 'compact' && <span className="tp-compact-label">{label}</span>}
    </div>
  )
}
