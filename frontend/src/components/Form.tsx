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
          {rule && <p className="section-rule">{withLinks(rule, links)}</p>}
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

// A section prompt with its source links read inline at "{links}":
// "See what expert forecasters are saying at avalanche.org or avalanche.ca, …"
function withLinks(rule: string, links?: SourceLink[]): ReactNode {
  const [before, after] = rule.split('{links}')
  if (after === undefined) return rule
  if (!links || links.length === 0) return before + after
  return (
    <>
      {before} at{' '}
      {links.map((l, i) => (
        <span key={l.href}>
          {i > 0 && (i === links.length - 1 ? ' or ' : ', ')}
          <a className="source-link" href={l.href} target="_blank" rel="noopener noreferrer" title={`${l.region} avalanche forecasts`}>
            {l.label}
            <Icon name="external" size={11} />
            <span className="sr-only"> ({l.region} forecasts, opens in a new tab)</span>
          </a>
        </span>
      ))}
      {after}
    </>
  )
}
