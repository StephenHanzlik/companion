import { ReactNode, useId } from 'react'
import type { SourceLink } from '../api/planForm'
import Icon from './Icon'

// Shared pieces for the phase forms: section cards, labelled fields, and
// folded guidance.

export function SectionCard({
  no,
  title,
  status,
  summary,
  rule,
  links,
  open,
  onOpen,
  footer,
  children,
}: {
  no: string
  title: string
  status: ReactNode
  summary?: string
  rule?: string
  links?: SourceLink[]
  open: boolean
  onOpen: () => void
  footer?: ReactNode
  children: ReactNode
}) {
  const bodyId = useId()
  return (
    <section className={`card section${open ? ' is-open' : ''}`}>
      <h2 className="section-head">
        <button type="button" className="section-toggle" aria-expanded={open} aria-controls={bodyId} onClick={onOpen}>
          <span className="section-no">{no}</span>
          <span className="section-title">
            {title}
            {!open && summary && <span className="section-summary">{summary}</span>}
          </span>
          <span className="section-status">{status}</span>
          <Icon name="chevron-down" className="section-chevron" />
        </button>
      </h2>
      {open && (
        <div id={bodyId}>
          {rule && (
            <div className="section-rule">
              <p>{rule}</p>
              {links && links.length > 0 && <SourceLinks label="Find your forecast" links={links} />}
            </div>
          )}
          <div className="section-body">{children}</div>
          {footer && <div className="section-foot">{footer}</div>}
        </div>
      )}
    </section>
  )
}

// A plain card with a header row, for content that is always open.
export function Card({
  title,
  aside,
  children,
  id,
  className,
}: {
  title: ReactNode
  aside?: ReactNode
  children: ReactNode
  id?: string
  className?: string
}) {
  return (
    <section className={`card ${className ?? ''}`} id={id}>
      <div className="card-head">
        <h2 className="card-title">{title}</h2>
        {aside && <div className="card-aside">{aside}</div>}
      </div>
      {children}
    </section>
  )
}

export function Field({
  label,
  help,
  children,
  htmlFor,
  className,
}: {
  label: ReactNode
  help?: ReactNode
  children: ReactNode
  htmlFor?: string
  className?: string
}) {
  return (
    <div className={`field ${className ?? ''}`}>
      <label className="field-label" htmlFor={htmlFor}>
        {label}
        {help && <span className="field-help"> {help}</span>}
      </label>
      {children}
    </div>
  )
}

// Field-book guidance folded under the field it belongs to.
export function Guide({ title = 'Guidance', children }: { title?: string; children: ReactNode }) {
  return (
    <details className="guide">
      <summary>{title}</summary>
      <div className="guide-body">{children}</div>
    </details>
  )
}

export function Count({ done, total }: { done: number; total: number }) {
  if (total > 0 && done === total) {
    return (
      <span className="count count-done">
        <Icon name="check" size={14} />
        Done
      </span>
    )
  }
  if (done === 0) return <span className="count">Not started</span>
  return (
    <span className="count">
      {done} of {total}
    </span>
  )
}

export function SavedAt({ at, where }: { at: string | null; where?: string }) {
  if (!at) return <span className="saved">Not saved yet</span>
  const time = new Date(at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  return (
    <span className="saved">
      Saved {time}
      {where ? ` · ${where}` : ''}
    </span>
  )
}

// External sources for a section, e.g. where to read the avalanche forecast.
export function SourceLinks({ label, links }: { label: string; links: SourceLink[] }) {
  return (
    <p className="source-links">
      <span>{label}:</span>
      {links.map((l, i) => (
        <span key={l.href}>
          <a href={l.href} target="_blank" rel="noopener noreferrer">
            {l.label}
            <Icon name="external" size={12} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>{' '}
          <span className="source-region">({l.region})</span>
          {i < links.length - 1 && <span aria-hidden="true"> · </span>}
        </span>
      ))}
    </p>
  )
}
