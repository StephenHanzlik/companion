import { FormEvent, useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Observation, ObservationType, SnowProfileTest, SnowTestType } from '../api/types'

const OBSERVATION_TYPES: ObservationType[] = ['weather', 'terrain', 'avalanche', 'red_flag', 'general']
const SNOW_TEST_TYPES: SnowTestType[] = [
  'compression_test',
  'extended_column_test',
  'propagation_saw_test',
  'pit_profile',
  'other',
]

export default function RideTab({ tripId }: { tripId: string }) {
  const [observations, setObservations] = useState<Observation[]>([])
  const [tests, setTests] = useState<SnowProfileTest[]>([])
  const [error, setError] = useState<string | null>(null)

  const [obsType, setObsType] = useState<ObservationType>('general')
  const [obsNotes, setObsNotes] = useState('')

  const [testType, setTestType] = useState<SnowTestType>('compression_test')
  const [testAspect, setTestAspect] = useState('')
  const [testSlope, setTestSlope] = useState('')
  const [testNotes, setTestNotes] = useState('')

  function reload() {
    api.listObservations(tripId).then((o) => setObservations(o ?? [])).catch((e) => setError(String(e)))
    api.listSnowTests(tripId).then((t) => setTests(t ?? [])).catch((e) => setError(String(e)))
  }

  useEffect(reload, [tripId])

  async function handleAddObservation(e: FormEvent) {
    e.preventDefault()
    try {
      await api.createObservation(tripId, { observation_type: obsType, notes: obsNotes || undefined })
      setObsNotes('')
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
      })
      setTestAspect('')
      setTestSlope('')
      setTestNotes('')
      reload()
    } catch (e) {
      setError(String(e))
    }
  }

  return (
    <div>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <div className="card">
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
        {observations.length === 0 && <p className="muted">None logged yet.</p>}
        {observations.map((o) => (
          <div key={o.id} className="list-item">
            <strong>{o.observation_type}</strong>{' '}
            <span className="muted">{new Date(o.observed_at).toLocaleString()}</span>
            {o.notes && <div>{o.notes}</div>}
          </div>
        ))}
      </div>

      <div className="card">
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
        {tests.map((t) => (
          <div key={t.id} className="list-item">
            <strong>{t.test_type}</strong>{' '}
            <span className="muted">
              {t.aspect ?? '—'} {t.slope_angle_deg ? `${t.slope_angle_deg}°` : ''} ·{' '}
              {new Date(t.recorded_at).toLocaleString()}
            </span>
            {t.notes && <div>{t.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
