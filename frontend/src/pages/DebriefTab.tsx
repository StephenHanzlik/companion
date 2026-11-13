import { useEffect, useId, useMemo, useState } from 'react'
import { api } from '../api/client'
import type { Debrief, DecisionReflection, Observation, SnowProfileTest } from '../api/types'
import { buildFieldRecord, formatTime } from '../api/records'
import { stateName } from '../api/states'
import { formatDate } from '../api/format'
import { Card, Field } from '../components/Form'
import Icon from '../components/Icon'
import { OverviewCard, OvList, OvNote, Progress } from '../components/Overview'
import { PhaseFrame, PhaseProps } from './TripWorkspace'

const newReflection = (): DecisionReflection => ({
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
  decision: '',
  reflection: '',
  entry_ids: [],
})

function readReflections(raw: unknown): DecisionReflection[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((r): r is Partial<DecisionReflection> => !!r && typeof r === 'object')
    .map((r) => ({ ...newReflection(), ...r, entry_ids: Array.isArray(r.entry_ids) ? r.entry_ids : [] }))
}

export default function DebriefTab({ trip, sheet, header, onStatusChange, onGoTo }: PhaseProps) {
  const ids = useId()
  const [debrief, setDebrief] = useState<Debrief | null>(null)
  const [observations, setObservations] = useState<Observation[]>([])
  const [tests, setTests] = useState<SnowProfileTest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [summary, setSummary] = useState('')
  const [reflections, setReflections] = useState<DecisionReflection[]>([])
  const [lessons, setLessons] = useState('')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    Promise.all([
      api.getDebrief(trip.id).catch((e) => {
        // No debrief yet is the normal starting state.
        if (String(e).includes('404')) return null
        throw e
      }),
      api.listObservations(trip.id),
      api.listSnowTests(trip.id),
    ])
      .then(([d, o, t]) => {
        if (!alive) return
        setDebrief(d)
        setSummary(d?.summary ?? '')
        setLessons(d?.lessons_learned ?? '')
        setReflections(readReflections(d?.decision_reflections))
        setObservations(o ?? [])
        setTests(t ?? [])
      })
      .catch((e) => alive && setLoadError(String(e)))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [trip.id])

  const record = useMemo(() => buildFieldRecord(observations, tests), [observations, tests])
  const codeOf = useMemo(() => new Map(record.map((e) => [e.id, e.code])), [record])

  const edit = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setDirty(true)
  }
  const setReflection = (i: number, patch: Partial<DecisionReflection>) => {
    setReflections((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
    setDirty(true)
  }

  async function save(): Promise<Debrief | null> {
    setSaving(true)
    setError(null)
    try {
      const saved = await api.upsertDebrief(trip.id, {
        summary,
        lessons_learned: lessons,
        decision_reflections: reflections.filter((r) => r.decision.trim() || r.reflection.trim()),
      })
      setDebrief(saved)
      setDirty(false)
      return saved
    } catch (e) {
      setError(`Couldn’t save the debrief: ${String(e)}`)
      return null
    } finally {
      setSaving(false)
    }
  }

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      if (dirty || !debrief) {
        const saved = await save()
        if (!saved) return
      }
      const done = await api.submitDebrief(trip.id)
      setDebrief(done)
      if (trip.status !== 'debriefed') await onStatusChange('debriefed')
    } catch (e) {
      setError(`Couldn’t submit the debrief: ${String(e)}`)
    } finally {
      setSubmitting(false)
    }
  }

  const filledReflections = reflections.filter((r) => r.decision.trim())
  const linked = new Set(reflections.flatMap((r) => r.entry_ids))
  const steps = [summary.trim().length > 0, filledReflections.length > 0, lessons.trim().length > 0, !!debrief?.submitted_at]

  const aside = (
    <OverviewCard
      label="Debrief overview"
      title={trip.title}
      meta={<><span className="mono">Sheet {sheet}</span> · {stateName(trip.state) ?? 'No state'} · {trip.start_date ? formatDate(trip.start_date) : 'No date'}</>}
    >
      <Progress
        steps={steps.map((s, i) => (s ? 'done' : i === steps.findIndex((x) => !x) ? 'current' : 'ahead'))}
        label="Debrief"
        value={debrief?.submitted_at ? 'Submitted' : dirty ? 'Unsaved changes' : debrief ? 'Draft saved' : 'Not started'}
      />
      <OvList
        rows={[
          { label: 'Field record', value: `${record.length} ${record.length === 1 ? 'entry' : 'entries'}`, empty: record.length === 0 },
          { label: 'Decision points', value: filledReflections.length || 'None yet', empty: filledReflections.length === 0 },
          { label: 'Entries referenced', value: linked.size ? `${linked.size} of ${record.length}` : 'None yet', empty: linked.size === 0 },
          {
            label: 'Submitted',
            value: debrief?.submitted_at ? formatDate(debrief.submitted_at.slice(0, 10)) : 'Not yet',
            empty: !debrief?.submitted_at,
          },
        ]}
      />
      {filledReflections.length > 0 && (
        <>
          <h3 className="ov-subhead">Decisions</h3>
          <ul className="ov-decisions">
            {filledReflections.map((r) => (
              <li key={r.id}>
                <span>{r.decision}</span>
                {r.entry_ids.length > 0 && (
                  <span className="mono">{r.entry_ids.map((id) => codeOf.get(id)).filter(Boolean).join(' · ')}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      <OvNote>Link each decision to the entries behind it, so next season you can see why you chose what you did.</OvNote>
    </OverviewCard>
  )

  if (loading) {
    return (
      <PhaseFrame header={header} aside={aside}>
        <div className="skeleton-list" aria-label="Loading debrief">
          <span />
          <span />
          <span />
        </div>
      </PhaseFrame>
    )
  }

  return (
    <PhaseFrame header={header} aside={aside}>
      <div className="stack">
        {loadError && <p className="callout callout-error">Couldn’t load the debrief. {loadError}</p>}

        <Card title="Summary">
          <div className="card-body">
            <Field label="How did the day go?" help="— where you went, conditions, how the plan held up" htmlFor={`${ids}-sum`}>
              <textarea id={`${ids}-sum`} className="input" rows={4} value={summary} onChange={(e) => edit(setSummary)(e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card title="Decision points" aside={<span className="count">{filledReflections.length || 'None yet'}</span>}>
          <div className="card-body">
            <p className="help help-lead">
              Pick the moments that mattered: where you committed, changed plans, or turned around. Say what you decided, what you based it
              on, and whether you’d decide the same way again.
            </p>
            <div className="reflections">
              {reflections.map((r, i) => (
                <div key={r.id} className="reflection">
                  <Field label="Decision" htmlFor={`${ids}-d-${i}`}>
                    <input
                      id={`${ids}-d-${i}`}
                      className="input"
                      placeholder="e.g. Turned around at the first bench"
                      value={r.decision}
                      onChange={(e) => setReflection(i, { decision: e.target.value })}
                    />
                  </Field>
                  <Field label="Looking back" htmlFor={`${ids}-r-${i}`}>
                    <textarea
                      id={`${ids}-r-${i}`}
                      className="input"
                      rows={3}
                      placeholder="What did you base it on? Would you decide the same way again?"
                      value={r.reflection}
                      onChange={(e) => setReflection(i, { reflection: e.target.value })}
                    />
                  </Field>
                  <fieldset className="field">
                    <legend className="field-label">
                      Based on <span className="field-help">— entries from the field record</span>
                    </legend>
                    {record.length === 0 ? (
                      <p className="help">
                        No field record yet.{' '}
                        <button type="button" className="link-btn" onClick={() => onGoTo('ride')}>
                          Write up the day in Ride
                        </button>{' '}
                        to link entries here.
                      </p>
                    ) : (
                      <div className="link-list">
                        {record.map((e) => {
                          const on = r.entry_ids.includes(e.id)
                          return (
                            <button
                              key={e.id}
                              type="button"
                              className="link-pick"
                              aria-pressed={on}
                              onClick={() =>
                                setReflection(i, {
                                  entry_ids: on ? r.entry_ids.filter((x) => x !== e.id) : [...r.entry_ids, e.id],
                                })
                              }
                            >
                              <span className="mono">{e.code}</span>
                              <span className="link-pick-title">{e.title}</span>
                              <span className="link-pick-time">{formatTime(e.at)}</span>
                              {on && <Icon name="check" size={14} />}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </fieldset>
                  <button
                    type="button"
                    className="icon-btn reflection-remove"
                    aria-label={`Remove decision point ${i + 1}`}
                    onClick={() => {
                      setReflections((rs) => rs.filter((_, idx) => idx !== i))
                      setDirty(true)
                    }}
                  >
                    <Icon name="x" size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-dashed"
              onClick={() => {
                setReflections((rs) => [...rs, newReflection()])
                setDirty(true)
              }}
            >
              <Icon name="plus" size={14} />
              Add decision point
            </button>
          </div>
        </Card>

        <Card title="Lessons learned">
          <div className="card-body">
            <Field label="What would you do differently?" htmlFor={`${ids}-les`}>
              <textarea id={`${ids}-les`} className="input" rows={4} value={lessons} onChange={(e) => edit(setLessons)(e.target.value)} />
            </Field>
          </div>
        </Card>

        <div className="card action-bar">
          {error ? (
            <span className="saved saved-error">{error}</span>
          ) : debrief?.submitted_at ? (
            <span className="saved saved-ok">
              <Icon name="check" size={14} />
              Submitted {new Date(debrief.submitted_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              {dirty && ' · unsaved changes'}
            </span>
          ) : (
            <span className="saved">{dirty ? 'Unsaved changes' : debrief ? 'Draft saved to this trip' : 'Not saved yet'}</span>
          )}
          <div className="btn-row">
            <button type="button" className="btn btn-quiet" onClick={save} disabled={saving || submitting || !dirty}>
              {saving ? 'Saving…' : 'Save draft'}
            </button>
            {!debrief?.submitted_at && (
              <button type="button" className="btn btn-accent" onClick={submit} disabled={submitting || saving}>
                {submitting ? 'Submitting…' : 'Submit debrief'}
              </button>
            )}
          </div>
        </div>
      </div>
    </PhaseFrame>
  )
}
