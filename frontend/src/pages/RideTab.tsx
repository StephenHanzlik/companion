import { FormEvent, useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Observation, ObservationType, SnowProfileTest, SnowTestType } from '../api/types'
import LocationPicker, { PlaceValue } from '../components/LocationPicker'
import DepartureCheck from '../components/DepartureCheck'
import StayAwareLoop from '../components/StayAwareLoop'

const OBSERVATION_TYPES: ObservationType[] = ['weather', 'terrain', 'avalanche', 'red_flag', 'general']
const SNOW_TEST_TYPES: SnowTestType[] = [
  'compression_test',
  'extended_column_test',
  'propagation_saw_test',
  'pit_profile',
  'other',
]

// Location name and relevance ride in the existing JSON columns
// (observations.data, snow_profile_tests.results) until they get real columns.
interface FieldContext {
  location_name?: string
  relevance?: string
  kind?: string
}

const contextOf = (json: unknown): FieldContext =>
  json && typeof json === 'object' ? (json as FieldContext) : {}

const emptyPlace = (): PlaceValue => ({ name: '', lat: null, lon: null })

const FIELD_NOTE_KINDS = [
  { value: 'plan_change', label: 'Change to the trip plan' },
  { value: 'tactic', label: 'Tactic used to reduce risk' },
] as const

// Hints from the field book's "what is worth recording" list. Each one links
// to the section where it gets recorded.
const RECORDING_HINTS = [
  { text: 'Avalanches observed', href: '#observations' },
  { text: 'Signs of unstable conditions or snowpack observations', href: '#snow-tests' },
  { text: 'Field weather observations', href: '#observations' },
  { text: 'Changes to the trip plan', href: '#field-notes' },
  { text: 'Tactics used to reduce risk', href: '#field-notes' },
] as const

function PlaceLine({ place, relevance }: { place: FieldContext; relevance?: string }) {
  return (
    <>
      {place.location_name && <div className="field-line"><span className="field-tag">Where</span> {place.location_name}</div>}
      {relevance && <div className="field-line"><span className="field-tag">Why it matters</span> {relevance}</div>}
    </>
  )
}

export default function RideTab({ tripId }: { tripId: string }) {
  const [observations, setObservations] = useState<Observation[]>([])
  const [tests, setTests] = useState<SnowProfileTest[]>([])
  const [error, setError] = useState<string | null>(null)

  const [obsType, setObsType] = useState<ObservationType>('general')
  const [obsNotes, setObsNotes] = useState('')
  const [obsPlace, setObsPlace] = useState<PlaceValue>(emptyPlace)
  const [obsRelevance, setObsRelevance] = useState('')

  const [testType, setTestType] = useState<SnowTestType>('compression_test')
  const [testAspect, setTestAspect] = useState('')
  const [testSlope, setTestSlope] = useState('')
  const [testNotes, setTestNotes] = useState('')
  const [testPlace, setTestPlace] = useState<PlaceValue>(emptyPlace)
  const [testRelevance, setTestRelevance] = useState('')

  const [noteKind, setNoteKind] = useState<(typeof FIELD_NOTE_KINDS)[number]['value']>('plan_change')
  const [noteText, setNoteText] = useState('')

  function reload() {
    api.listObservations(tripId).then((o) => setObservations(o ?? [])).catch((e) => setError(String(e)))
    api.listSnowTests(tripId).then((t) => setTests(t ?? [])).catch((e) => setError(String(e)))
  }

  useEffect(reload, [tripId])

  async function handleAddObservation(e: FormEvent) {
    e.preventDefault()
    try {
      await api.createObservation(tripId, {
        observation_type: obsType,
        notes: obsNotes || undefined,
        latitude: obsPlace.lat ?? undefined,
        longitude: obsPlace.lon ?? undefined,
        data: { location_name: obsPlace.name || undefined, relevance: obsRelevance || undefined },
      })
      setObsNotes('')
      setObsPlace(emptyPlace())
      setObsRelevance('')
      reload()
    } catch (e) {
      setError(String(e))
    }
  }

  async function handleAddTest(e: FormEvent) {
    e.preventDefault()
    try {
      await api.createSnowTest(tripId, {
        test_type: testType,
        aspect: testAspect || undefined,
        slope_angle_deg: testSlope ? Number(testSlope) : undefined,
        notes: testNotes || undefined,
        latitude: testPlace.lat ?? undefined,
        longitude: testPlace.lon ?? undefined,
        results: { location_name: testPlace.name || undefined, relevance: testRelevance || undefined },
      })
      setTestAspect('')
      setTestSlope('')
      setTestNotes('')
      setTestPlace(emptyPlace())
      setTestRelevance('')
      reload()
    } catch (e) {
      setError(String(e))
    }
  }

  async function handleAddFieldNote(e: FormEvent) {
    e.preventDefault()
    if (!noteText.trim()) return
    try {
      await api.createObservation(tripId, {
        observation_type: 'general',
        notes: noteText,
        data: { kind: noteKind },
      })
      setNoteText('')
      reload()
    } catch (e) {
      setError(String(e))
    }
  }

  const fieldNotes = observations.filter((o) => contextOf(o.data).kind)
  const otherObservations = observations.filter((o) => !contextOf(o.data).kind)

  return (
    <div className="ride-page">
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <DepartureCheck />
      <StayAwareLoop />

      <section className="card" aria-labelledby="hints-title">
        <h3 id="hints-title">What is worth recording</h3>
        <ul className="hint-list">
          {RECORDING_HINTS.map((h) => (
            <li key={h.text}>
              <a href={h.href}>{h.text}</a>
            </li>
          ))}
        </ul>
      </section>

      <div className="card" id="observations">
        <h3>Add observation</h3>
        <form onSubmit={handleAddObservation}>
          <div className="field">
            <label>Type</label>
            <select value={obsType} onChange={(e) => setObsType(e.target.value as ObservationType)}>
              {OBSERVATION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <LocationPicker value={obsPlace} onChange={setObsPlace} />
          <div className="field">
            <label>Relevance</label>
            <p className="plan-help">Why this matters for today's decisions.</p>
            <textarea
              rows={2}
              value={obsRelevance}
              placeholder="e.g. Shooting cracks on wind-loaded NE aspect at treeline. Matches the wind slab problem. Avoid similar slopes."
              onChange={(e) => setObsRelevance(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea rows={2} value={obsNotes} onChange={(e) => setObsNotes(e.target.value)} />
          </div>
          <button className="primary" type="submit">
            Log observation
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Observations</h3>
        {otherObservations.length === 0 && <p className="muted">None logged yet.</p>}
        {otherObservations.map((o) => {
          const ctx = contextOf(o.data)
          return (
            <div key={o.id} className="list-item field-card">
              <strong>{o.observation_type}</strong>{' '}
              <span className="muted">{new Date(o.observed_at).toLocaleString()}</span>
              <PlaceLine place={ctx} relevance={ctx.relevance} />
              {o.notes && <div className="field-line">{o.notes}</div>}
            </div>
          )
        })}
      </div>

      <div className="card" id="field-notes">
        <h3>Field notes</h3>
        <p className="muted">Record a change to the trip plan or a tactic you used to reduce risk.</p>
        <form onSubmit={handleAddFieldNote}>
          <div className="field">
            <label>Kind</label>
            <select value={noteKind} onChange={(e) => setNoteKind(e.target.value as typeof noteKind)}>
              {FIELD_NOTE_KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Note</label>
            <textarea rows={2} value={noteText} onChange={(e) => setNoteText(e.target.value)} />
          </div>
          <button className="primary" type="submit" disabled={!noteText.trim()}>
            Add note
          </button>
        </form>
        {fieldNotes.map((o) => (
          <div key={o.id} className="list-item field-card">
            <strong>{FIELD_NOTE_KINDS.find((k) => k.value === contextOf(o.data).kind)?.label ?? 'Note'}</strong>{' '}
            <span className="muted">{new Date(o.observed_at).toLocaleString()}</span>
            {o.notes && <div className="field-line">{o.notes}</div>}
          </div>
        ))}
      </div>

      <div className="card" id="snow-tests">
        <h3>Add snow profile test</h3>
        <form onSubmit={handleAddTest}>
          <div className="field">
            <label>Test type</label>
            <select value={testType} onChange={(e) => setTestType(e.target.value as SnowTestType)}>
              {SNOW_TEST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="row">
            <div className="field" style={{ flex: 1 }}>
              <label>Aspect</label>
              <input value={testAspect} onChange={(e) => setTestAspect(e.target.value)} placeholder="NE" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Slope angle (deg)</label>
              <input
                type="number"
                value={testSlope}
                onChange={(e) => setTestSlope(e.target.value)}
                placeholder="35"
              />
            </div>
          </div>
          <LocationPicker value={testPlace} onChange={setTestPlace} />
          <div className="field">
            <label>Relevance</label>
            <p className="plan-help">Why this test matters for today's decisions.</p>
            <textarea
              rows={2}
              value={testRelevance}
              onChange={(e) => setTestRelevance(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea rows={2} value={testNotes} onChange={(e) => setTestNotes(e.target.value)} />
          </div>
          <button className="primary" type="submit">
            Log test
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Snow profile tests</h3>
        {tests.length === 0 && <p className="muted">None logged yet.</p>}
        {tests.map((t) => {
          const ctx = contextOf(t.results)
          return (
            <div key={t.id} className="list-item field-card">
              <strong>{t.test_type}</strong>{' '}
              <span className="muted">
                {t.aspect ?? '—'} {t.slope_angle_deg ? `${t.slope_angle_deg}°` : ''} ·{' '}
                {new Date(t.recorded_at).toLocaleString()}
              </span>
              <PlaceLine place={ctx} relevance={ctx.relevance} />
              {t.notes && <div className="field-line">{t.notes}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
