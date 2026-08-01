import { FormEvent, useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Debrief } from '../api/types'

export default function DebriefTab({ tripId }: { tripId: string }) {
  const [debrief, setDebrief] = useState<Debrief | null>(null)
  const [summary, setSummary] = useState('')
  const [lessonsLearned, setLessonsLearned] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api
      .getDebrief(tripId)
      .then((d) => {
        setDebrief(d)
        setSummary(d.summary ?? '')
        setLessonsLearned(d.lessons_learned ?? '')
      })
      .catch(() => setDebrief(null))
  }, [tripId])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const saved = await api.upsertDebrief(tripId, {
        summary,
        lessons_learned: lessonsLearned,
      } as Partial<Debrief>)
      setDebrief(saved)
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit() {
    try {
      const saved = await api.submitDebrief(tripId)
      setDebrief(saved)
      await api.updateTripStatus(tripId, 'debriefed')
    } catch (e) {
      setError(String(e))
    }
  }

  return (
    <div className="card">
      <h3>Debrief</h3>
      <p className="muted">Summarize the trip and reflect on decisions before submitting.</p>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <form onSubmit={handleSave}>
        <div className="field">
          <label>Summary</label>
          <textarea rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <div className="field">
          <label>Lessons learned / what would you do differently</label>
          <textarea rows={4} value={lessonsLearned} onChange={(e) => setLessonsLearned(e.target.value)} />
        </div>
        <div className="row">
          <button className="primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save debrief'}
          </button>
          <button type="button" onClick={handleSubmit} disabled={!debrief}>
            Submit debrief
          </button>
          {debrief?.submitted_at && (
            <span className="muted">Submitted at {new Date(debrief.submitted_at).toLocaleString()}</span>
          )}
        </div>
      </form>
    </div>
  )
}
