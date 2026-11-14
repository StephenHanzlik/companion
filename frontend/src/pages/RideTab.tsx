import { FormEvent, useEffect, useId, useMemo, useState } from 'react'
import { api } from '../api/client'
import type { Observation, ObservationType, SnowProfileTest, SnowTestType } from '../api/types'
import {
  FIELD_NOTE_KINDS,
  FieldEntry,
  OBSERVATION_TYPES,
  SNOW_TEST_TYPES,
  buildFieldRecord,
  defaultEntryTime,
  formatTime,
  localInputToIso,
} from '../api/records'
import { stateName } from '../api/states'
import { formatDate } from '../api/format'
import { ASPECT_NAMES } from '../api/planForm'
import LocationPicker, { PlaceValue } from '../components/LocationPicker'
import FieldReminders from '../components/FieldReminders'
import { CompassPicker } from '../components/AspectPicker'
import { Card, Field } from '../components/Form'
import Icon from '../components/Icon'
import { OverviewCard, OvList, OvNote } from '../components/Overview'
import { PhaseFrame, PhaseProps } from './TripWorkspace'

type EntryForm = 'observation' | 'test' | 'note'

const ENTRY_FORMS: { id: EntryForm; label: string }[] = [
  { id: 'observation', label: 'Observation' },
  { id: 'test', label: 'Snow test' },
  { id: 'note', label: 'Field note' },
]

const emptyPlace = (): PlaceValue => ({ name: '', lat: null, lon: null })

function EntryRow({ e }: { e: FieldEntry }) {
  return (
    <li className="entry">
      <div className="entry-when">
        <span className="mono">{e.code}</span>
        <time dateTime={e.at}>{formatTime(e.at)}</time>
      </div>
      <div className="entry-body">
        <div className="badges">
          {e.badges.map((b) => (
            <span key={b.label} className={`badge${b.tone === 'flag' ? ' badge-flag' : ''}`}>
              {b.label}
            </span>
          ))}
        </div>
        <h3 className="entry-title">{e.title}</h3>
        {e.facts && e.facts.length > 0 && (
          <dl className="facts">
            {e.facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {e.where && (
          <p className="entry-where">
            <Icon name="pin" size={14} />
            {e.where}
          </p>
        )}
        {e.body && <p className="entry-text">{e.body}</p>}
        {e.why && (
          <p className="entry-why">
            <span>Why it matters</span>
            {e.why}
          </p>
        )}
      </div>
    </li>
  )
}

export default function RideTab({ trip, sheet, header, onGoTo }: PhaseProps) {
  const ids = useId()
  const [observations, setObservations] = useState<Observation[]>([])
  const [tests, setTests] = useState<SnowProfileTest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [mode, setMode] = useState<EntryForm>('observation')
  const [when, setWhen] = useState(() => defaultEntryTime(trip.start_date))
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [justAdded, setJustAdded] = useState<string | null>(null)

  const [obsType, setObsType] = useState<ObservationType>('avalanche')
  const [obsText, setObsText] = useState('')
  const [obsPlace, setObsPlace] = useState<PlaceValue>(emptyPlace)
  const [obsWhy, setObsWhy] = useState('')

  const [testType, setTestType] = useState<SnowTestType>('extended_column_test')
  const [testResult, setTestResult] = useState('')
  const [testAspect, setTestAspect] = useState('')
  const [testSlope, setTestSlope] = useState('')
  const [testElevFt, setTestElevFt] = useState('')
  const [testNotes, setTestNotes] = useState('')
  const [testPlace, setTestPlace] = useState<PlaceValue>(emptyPlace)
  const [testWhy, setTestWhy] = useState('')

  const [noteKind, setNoteKind] = useState<(typeof FIELD_NOTE_KINDS)[number]['value']>('plan_change')
  const [noteText, setNoteText] = useState('')

  function reload() {
    setLoadError(null)
    return Promise.all([api.listObservations(trip.id), api.listSnowTests(trip.id)])
      .then(([o, t]) => {
        setObservations(o ?? [])
        setTests(t ?? [])
      })
      .catch((e) => setLoadError(String(e)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    reload()
  }, [trip.id])

  const record = useMemo(() => buildFieldRecord(observations, tests), [observations, tests])

  const canSubmit =
    !saving &&
    (mode === 'observation' ? obsText.trim().length > 0 : mode === 'test' ? testResult.trim().length > 0 || testNotes.trim().length > 0 : noteText.trim().length > 0)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    setSaveError(null)
    const at = localInputToIso(when)
    try {
      if (mode === 'observation') {
        await api.createObservation(trip.id, {
          observation_type: obsType,
          observed_at: at,
          notes: obsText.trim(),
          latitude: obsPlace.lat ?? undefined,
          longitude: obsPlace.lon ?? undefined,
          data: { location_name: obsPlace.name.trim() || undefined, relevance: obsWhy.trim() || undefined },
        })
        setObsText('')
        setObsPlace(emptyPlace())
        setObsWhy('')
      } else if (mode === 'test') {
        await api.createSnowTest(trip.id, {
          test_type: testType,
          recorded_at: at,
          aspect: testAspect || undefined,
          slope_angle_deg: testSlope ? Number(testSlope) : undefined,
          elevation_m: testElevFt ? Math.round(Number(testElevFt) / 3.28084) : undefined,
          notes: testNotes.trim() || undefined,
          latitude: testPlace.lat ?? undefined,
          longitude: testPlace.lon ?? undefined,
          results: {
            result: testResult.trim() || undefined,
            location_name: testPlace.name.trim() || undefined,
            relevance: testWhy.trim() || undefined,
          },
        })
        setTestResult('')
        setTestAspect('')
        setTestSlope('')
        setTestElevFt('')
        setTestNotes('')
        setTestPlace(emptyPlace())
        setTestWhy('')
      } else {
        await api.createObservation(trip.id, {
          observation_type: 'general',
          observed_at: at,
          notes: noteText.trim(),
          data: { kind: noteKind },
        })
        setNoteText('')
      }
      await reload()
      setJustAdded(ENTRY_FORMS.find((f) => f.id === mode)!.label)
    } catch (err) {
      setSaveError(`Couldn’t add this entry: ${String(err)}`)
    } finally {
      setSaving(false)
    }
  }

  const byType = (t: ObservationType) => observations.filter((o) => o.observation_type === t && !(o.data as { kind?: string } | null)?.kind).length
  const notesOf = (kind: string) => observations.filter((o) => (o.data as { kind?: string } | null)?.kind === kind).length
  const testInfo = SNOW_TEST_TYPES.find((t) => t.value === testType)

  const aside = (
    <OverviewCard
      label="Ride overview"
      title={trip.title}
      meta={<><span className="mono">Sheet {sheet}</span> · {stateName(trip.state) ?? 'No state'} · {trip.start_date ? formatDate(trip.start_date) : 'No date'}</>}
    >
      <OvList
        rows={[
          {
            label: 'Field record',
            value: record.length ? `${record.length} ${record.length === 1 ? 'entry' : 'entries'}` : 'Nothing yet',
            empty: record.length === 0,
          },
          {
            label: 'Time span',
            value: record.length > 1 ? `${formatTime(record[0].at)}–${formatTime(record[record.length - 1].at)}` : '—',
            empty: record.length < 2,
          },
        ]}
      />
      <h3 className="ov-subhead">Worth recording</h3>
      <OvList
        rows={[
          { label: 'Avalanches observed', value: byType('avalanche'), empty: byType('avalanche') === 0 },
          { label: 'Red flags', value: byType('red_flag'), empty: byType('red_flag') === 0 },
          { label: 'Snow tests', value: tests.length, empty: tests.length === 0 },
          { label: 'Field weather', value: byType('weather'), empty: byType('weather') === 0 },
          { label: 'Plan changes', value: notesOf('plan_change'), empty: notesOf('plan_change') === 0 },
          { label: 'Tactics to reduce risk', value: notesOf('tactic'), empty: notesOf('tactic') === 0 },
        ]}
      />
      <OvNote>Counts from the field record. Write up what your field book captured.</OvNote>
    </OverviewCard>
  )

  return (
    <PhaseFrame header={header} aside={aside}>
      <div className="stack">
        <details className="card reminders">
          <summary className="card-head">
            <span className="card-title">Field reminders</span>
            <span className="card-aside help">Departure check and the Stay aware loop</span>
            <Icon name="chevron-down" className="section-chevron" />
          </summary>
          <FieldReminders />
        </details>
        <Card title="Add to the field record" className="card-form">
          <form onSubmit={handleSubmit} className="card-body">
            <div className="form-top">
              <div className="segmented segmented-sm" role="tablist" aria-label="Entry type">
                {ENTRY_FORMS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={mode === f.id}
                    onClick={() => {
                      setMode(f.id)
                      setJustAdded(null)
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <Field label="When" htmlFor={`${ids}-when`} className="field-when">
                <input id={`${ids}-when`} className="input" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
              </Field>
            </div>

            {mode === 'observation' && (
              <>
                <fieldset className="field">
                  <legend className="field-label">Type</legend>
                  <div className="chip-row">
                    {OBSERVATION_TYPES.map((t) => (
                      <label key={t.value} className="chip-radio">
                        <input type="radio" name={`${ids}-otype`} checked={obsType === t.value} onChange={() => setObsType(t.value)} />
                        <span>{t.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <Field label="What you saw" help="— the first line becomes the headline" htmlFor={`${ids}-otext`}>
                  <textarea
                    id={`${ids}-otext`}
                    className="input"
                    rows={3}
                    placeholder={'Shooting cracks on a wind-loaded rollover\nAbout 2 m long, under skis, no collapse.'}
                    value={obsText}
                    onChange={(e) => setObsText(e.target.value)}
                  />
                </Field>
                <LocationPicker value={obsPlace} onChange={setObsPlace} />
                <Field label="Why it matters" help="— for today’s decisions" htmlFor={`${ids}-owhy`}>
                  <textarea
                    id={`${ids}-owhy`}
                    className="input"
                    rows={2}
                    placeholder="Matches the wind slab problem. Avoid similar slopes."
                    value={obsWhy}
                    onChange={(e) => setObsWhy(e.target.value)}
                  />
                </Field>
              </>
            )}

            {mode === 'test' && (
              <>
                <div className="grid-2">
                  <Field label="Test" htmlFor={`${ids}-ttype`}>
                    <select id={`${ids}-ttype`} className="input" value={testType} onChange={(e) => setTestType(e.target.value as SnowTestType)}>
                      {SNOW_TEST_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Result" help={testInfo?.help ? `— ${testInfo.help}` : undefined} htmlFor={`${ids}-tres`}>
                    <input id={`${ids}-tres`} className="input" value={testResult} onChange={(e) => setTestResult(e.target.value)} />
                  </Field>
                </div>
                <div className="test-where">
                  <div className="field">
                    <span className="field-label">Aspect{testAspect && <span className="field-help"> — {ASPECT_NAMES[testAspect]}</span>}</span>
                    <CompassPicker selected={testAspect ? [testAspect] : []} onToggle={(a) => setTestAspect(testAspect === a ? '' : a)} label="Aspect" />
                  </div>
                  <div className="test-nums">
                    <Field label="Slope angle" htmlFor={`${ids}-tslope`}>
                      <div className="input-unit">
                        <input id={`${ids}-tslope`} className="input" type="number" min={0} max={90} inputMode="numeric" value={testSlope} onChange={(e) => setTestSlope(e.target.value)} />
                        <span>°</span>
                      </div>
                    </Field>
                    <Field label="Elevation" htmlFor={`${ids}-telev`}>
                      <div className="input-unit">
                        <input id={`${ids}-telev`} className="input" type="number" min={0} inputMode="numeric" value={testElevFt} onChange={(e) => setTestElevFt(e.target.value)} />
                        <span>ft</span>
                      </div>
                    </Field>
                  </div>
                </div>
                <Field label="Notes" help="— layer, depth, fracture character" htmlFor={`${ids}-tnotes`}>
                  <textarea id={`${ids}-tnotes`} className="input" rows={2} value={testNotes} onChange={(e) => setTestNotes(e.target.value)} />
                </Field>
                <LocationPicker value={testPlace} onChange={setTestPlace} />
                <Field label="Why it matters" htmlFor={`${ids}-twhy`}>
                  <textarea id={`${ids}-twhy`} className="input" rows={2} value={testWhy} onChange={(e) => setTestWhy(e.target.value)} />
                </Field>
              </>
            )}

            {mode === 'note' && (
              <>
                <fieldset className="field">
                  <legend className="field-label">Kind</legend>
                  <div className="chip-row">
                    {FIELD_NOTE_KINDS.map((k) => (
                      <label key={k.value} className="chip-radio">
                        <input type="radio" name={`${ids}-nkind`} checked={noteKind === k.value} onChange={() => setNoteKind(k.value)} />
                        <span>{k.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <Field label="Note" help="— the first line becomes the headline" htmlFor={`${ids}-ntext`}>
                  <textarea
                    id={`${ids}-ntext`}
                    className="input"
                    rows={3}
                    placeholder={'Turned around at the first bench\nGroup consensus after the test result.'}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                </Field>
              </>
            )}

            <div className="form-foot">
              {saveError ? (
                <span className="saved saved-error">{saveError}</span>
              ) : justAdded ? (
                <span className="saved saved-ok">
                  <Icon name="check" size={14} />
                  {justAdded} added to the record
                </span>
              ) : (
                <span className="saved">Saved to this trip’s record</span>
              )}
              <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
                {saving ? 'Adding…' : 'Add to record'}
              </button>
            </div>
          </form>
        </Card>

        <Card
          title="Field record"
          aside={<span className="count">{loading ? 'Loading' : `${record.length} ${record.length === 1 ? 'entry' : 'entries'}`}</span>}
        >
          {loadError && <p className="callout callout-error card-pad">Couldn’t load the field record. {loadError}</p>}
          {loading && (
            <div className="skeleton-list card-pad" aria-label="Loading field record">
              <span />
              <span />
            </div>
          )}
          {!loading && !loadError && record.length === 0 && (
            <div className="empty card-pad">
              <p className="empty-title">Nothing recorded yet</p>
              <p>Start with what your field book captured: avalanches you saw, signs of instability, snow tests, field weather, and any change of plan.</p>
            </div>
          )}
          {record.length > 0 && (
            <ol className="entries">
              {record.map((e) => (
                <EntryRow key={e.id} e={e} />
              ))}
            </ol>
          )}
          {record.length > 0 && (
            <div className="card-foot">
              <span className="help">Finished writing up the day?</span>
              <button type="button" className="btn btn-quiet" onClick={() => onGoTo('debrief')}>
                Go to Debrief
                <Icon name="arrow-right" size={14} />
              </button>
            </div>
          )}
        </Card>

      </div>
    </PhaseFrame>
  )
}
