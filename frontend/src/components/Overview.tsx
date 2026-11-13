import type { ReactNode } from 'react'

// The graphite overview card that sits to the right of the work. Every phase
// fills it with its own summary; nothing in it is editable.

export function OverviewCard({
  title,
  meta,
  label,
  children,
}: {
  title: string
  meta: ReactNode
  label: string
  children: ReactNode
}) {
  return (
    <section className="overview" aria-label={label}>
      <span className="overview-hole" aria-hidden="true" />
      <h2 className="overview-title">{title}</h2>
      <p className="overview-meta">{meta}</p>
      {children}
    </section>
  )
}

// Segmented progress bar: one segment per step, done / current / ahead.
export function Progress({
  steps,
  label,
  value,
}: {
  steps: ('done' | 'current' | 'ahead')[]
  label: string
  value: string
}) {
  return (
    <div className="ov-progress">
      <div className="ov-bar" aria-hidden="true">
        {steps.map((s, i) => (
          <span key={i} className={`ov-seg ov-seg-${s}`} />
        ))}
      </div>
      <div className="ov-progress-label">
        <span>{label}</span>
        <span>{value}</span>
      </div>
    </div>
  )
}

export function OvList({ rows }: { rows: { label: string; value: ReactNode; empty?: boolean }[] }) {
  return (
    <dl className="ov-list">
      {rows.map((r) => (
        <div key={r.label}>
          <dt>{r.label}</dt>
          <dd className={r.empty ? 'is-empty' : undefined}>{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function OvNote({ children }: { children: ReactNode }) {
  return <p className="ov-note">{children}</p>
}
