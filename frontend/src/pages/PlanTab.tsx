import { FormEvent, useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Plan } from '../api/types'

function stringifyField(value: unknown): string {
  if (value === undefined || value === null) return ''
  return JSON.stringify(value, null, 2)
}

export default function PlanTab({ tripId }: { tripId: string }) {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [objectives, setObjectives] = useState('')
  const [route, setRoute] = useState('')
  const [hazards, setHazards] = useState('[]')
  const [checklist, setChecklist] = useState('[]')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api
      .getPlan(tripId)
      .then((p) => {
        setPlan(p)
        setObjectives(p.objectives ?? '')
        setRoute(p.route ?? '')
        setHazards(stringifyField(p.hazards) || '[]')
        setChecklist(stringifyField(p.checklist) || '[]')
      })
      .catch(() => setPlan(null))
  }, [tripId])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError(null)
    let hazardsParsed: unknown
    let checklistParsed: unknown
    try {
      hazardsParsed = JSON.parse(hazards)
      checklistParsed = JSON.parse(checklist)
    } catch {
      setError('Hazards and checklist must be valid JSON.')
      return
    }
    setSaving(true)
    try {
      const saved = await api.upsertPlan(tripId, {
        objectives,
        route,
        hazards: hazardsParsed,
        checklist: checklistParsed,
      } as Partial<Plan>)
      setPlan(saved)
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOff() {
    try {
      const saved = await api.signOffPlan(tripId)
      setPlan(saved)
    } catch (e) {
      setError(String(e))
    }
  }

  return (
    <div className="card">
      <h3>Plan</h3>
      <p className="muted">Trip objectives, route, hazards, and go/no-go checklist.</p>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <form onSubmit={handleSave}>
        <div className="field">
          <label>Objectives</label>
          <textarea rows={3} value={objectives} onChange={(e) => setObjectives(e.target.value)} />
        </div>
        <div className="field">
          <label>Route</label>
          <textarea rows={2} value={route} onChange={(e) => setRoute(e.target.value)} />
        </div>
        <div className="field">
          <label>Hazards (JSON array)</label>
          <textarea rows={4} value={hazards} onChange={(e) => setHazards(e.target.value)} />
        </div>
        <div className="field">
          <label>Go/no-go checklist (JSON array)</label>
          <textarea rows={4} value={checklist} onChange={(e) => setChecklist(e.target.value)} />
        </div>
        <div className="row">
          <button className="primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save plan'}
          </button>
          <button type="button" onClick={handleSignOff} disabled={!plan}>
            Sign off plan
          </button>
          {plan?.signed_off_at && (
            <span className="muted">Signed off at {new Date(plan.signed_off_at).toLocaleString()}</span>
          )}
        </div>
      </form>
    </div>
  )
}
