import { FormEvent, useState } from 'react'
import {
  ASPECTS,
  AvalancheProblem,
  GROUP_CHECKS,
  GroupCheckKey,
  GroupMember,
  PlanningForm,
  TERRAIN_MINDSETS,
  emptyMember,
  emptyPlanningForm,
  emptyProblem,
} from '../api/planForm'

// Mocked: nothing is sent to the API yet. The form keeps its state for the
// life of this tab only. Persistence comes once the data model is agreed.

function Help({ children }: { children: React.ReactNode }) {
  return <p className="plan-help">{children}</p>
}

function Section({
  title,
  rule,
  children,
}: {
  title: string
  rule?: string
  children: React.ReactNode
}) {
  return (
    <details className="plan-section">
      <summary>
        <span className="plan-section-title">{title}</span>
        {rule && <span className="plan-section-rule">{rule}</span>}
      </summary>
      <div className="plan-section-body">{children}</div>
    </details>
  )
}

export default function PlanTab(_props: { tripId: string }) {
  const [form, setForm] = useState<PlanningForm>(emptyPlanningForm)
  const [notice, setNotice] = useState<string | null>(null)
  const [signedOff, setSignedOff] = useState(false)

  function update<K extends keyof PlanningForm>(key: K, value: PlanningForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  // Group check-in rows
  function setMember(i: number, patch: Partial<GroupMember>) {
    update(
      'group',
      form.group.map((m, idx) => (idx === i ? { ...m, ...patch } : m)),
    )
  }
  function removeMember(i: number) {
    update('group', form.group.filter((_, idx) => idx !== i))
  }

  // Group discussion checklist
  function setCheck(key: GroupCheckKey, patch: Partial<PlanningForm['group_checks'][GroupCheckKey]>) {
    update('group_checks', { ...form.group_checks, [key]: { ...form.group_checks[key], ...patch } })
  }

  // Avalanche problems
  function setProblem(i: number, patch: Partial<AvalancheProblem>) {
    update(
      'avalanche_problems',
      form.avalanche_problems.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
    )
  }
  function toggleAspect(i: number, aspect: string) {
    const current = form.avalanche_problems[i].aspects
    const next = current.includes(aspect) ? current.filter((a) => a !== aspect) : [...current, aspect]
    setProblem(i, { aspects: next })
  }
  function removeProblem(i: number) {
    update('avalanche_problems', form.avalanche_problems.filter((_, idx) => idx !== i))
  }

  function handleSave(e: FormEvent) {
    e.preventDefault()
    setNotice('Saved for this session only. Saving to the trip is not wired up yet.')
  }

  function handleSignOff() {
    setSignedOff(true)
    setNotice('Signed off for this session only. Sign-off is not persisted yet.')
  }

  return (
    <form className="card plan-form" onSubmit={handleSave}>
      <div className="plan-header">
        <h3>Plan your trip</h3>
        <div className="field plan-date">
          <label>Date</label>
          <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
        </div>
      </div>
      {notice && <p className="plan-notice">{notice}</p>}

      {/* 1. Assemble your group */}
      <Section title="1. Assemble your group">
        <h4 className="plan-subhead">Group check-in</h4>
        <div className="table-scroll">
          <table className="plan-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact info</th>
                <th>Emergency contact</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {form.group.map((m, i) => (
                <tr key={i}>
                  <td>
                    <input value={m.name} onChange={(e) => setMember(i, { name: e.target.value })} />
                  </td>
                  <td>
                    <input value={m.contact} onChange={(e) => setMember(i, { contact: e.target.value })} />
                  </td>
                  <td>
                    <input
                      value={m.emergency_contact}
                      onChange={(e) => setMember(i, { emergency_contact: e.target.value })}
                    />
                  </td>
                  <td className="plan-row-actions">
                    {form.group.length > 1 && (
                      <button type="button" className="plan-link" onClick={() => removeMember(i)}>
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="plan-add" onClick={() => update('group', [...form.group, emptyMember()])}>
          + Add member
        </button>

        <h4 className="plan-subhead">Group discussion</h4>
        <ul className="plan-checklist">
          {GROUP_CHECKS.map((c) => (
            <li key={c.key}>
              <label className="plan-check">
                <input
                  type="checkbox"
                  checked={form.group_checks[c.key].checked}
                  onChange={(e) => setCheck(c.key, { checked: e.target.checked })}
                />
                <span>{c.label}</span>
              </label>
              {'help' in c && <Help>{c.help}</Help>}
              <input
                className="plan-note"
                placeholder="Notes (optional)"
                value={form.group_checks[c.key].notes}
                onChange={(e) => setCheck(c.key, { notes: e.target.value })}
              />
            </li>
          ))}
        </ul>
      </Section>

      {/* 2. Anticipate the hazard */}
      <Section title="2. Anticipate the hazard" rule="Read the local avalanche advisory. Get expert opinion.">
        <div className="field">
          <label>Weather factors</label>
          <Help>Current and forecast weather that can affect travel or hazard: snowfall, wind, drifting snow, warming.</Help>
          <textarea rows={3} value={form.weather_factors} onChange={(e) => update('weather_factors', e.target.value)} />
        </div>

        <h4 className="plan-subhead">Avalanche problems</h4>
        <div className="table-scroll">
          <table className="plan-table plan-problems">
            <thead>
              <tr>
                <th>#</th>
                <th>Problem type</th>
                <th>Size</th>
                <th>Elevation</th>
                <th>Aspect</th>
                <th>Terrain features</th>
                <th>Danger trend &amp; timing</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {form.avalanche_problems.map((p, i) => (
                <tr key={i}>
                  <td className="plan-rank">{i + 1}</td>
                  <td>
                    <input
                      placeholder="e.g. Wind Slab"
                      value={p.problem_type}
                      onChange={(e) => setProblem(i, { problem_type: e.target.value })}
                    />
                  </td>
                  <td>
                    <input value={p.size} onChange={(e) => setProblem(i, { size: e.target.value })} />
                  </td>
                  <td>
                    <input value={p.elevation} onChange={(e) => setProblem(i, { elevation: e.target.value })} />
                  </td>
                  <td>
                    <div className="aspect-chips">
                      {ASPECTS.map((a) => (
                        <button
                          key={a}
                          type="button"
                          aria-pressed={p.aspects.includes(a)}
                          className={p.aspects.includes(a) ? 'aspect on' : 'aspect'}
                          onClick={() => toggleAspect(i, a)}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td>
                    <input
                      value={p.terrain_features}
                      onChange={(e) => setProblem(i, { terrain_features: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={p.danger_trend_timing}
                      onChange={(e) => setProblem(i, { danger_trend_timing: e.target.value })}
                    />
                  </td>
                  <td className="plan-row-actions">
                    {i >= 2 && (
                      <button type="button" className="plan-link" onClick={() => removeProblem(i)}>
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className="plan-add"
          onClick={() => update('avalanche_problems', [...form.avalanche_problems, emptyProblem()])}
        >
          + Add problem
        </button>

        <div className="field">
          <label>Advisory key message</label>
          <Help>Note recent avalanches and travel advice.</Help>
          <textarea
            rows={3}
            value={form.advisory_key_message}
            onChange={(e) => update('advisory_key_message', e.target.value)}
          />
        </div>
      </Section>

      {/* 3. Plan to manage avalanche terrain */}
      <Section
        title="3. Plan to manage avalanche terrain"
        rule="Decide by consensus. Voice all concerns. Respect any veto. Challenge assumptions."
      >
        <div className="field">
          <label>Today's terrain mindset</label>
          <div className="mindset-options">
            {TERRAIN_MINDSETS.map((opt) => (
              <label key={opt.value} className="plan-check">
                <input
                  type="radio"
                  name="terrain_mindset"
                  value={opt.value}
                  checked={form.terrain_mindset === opt.value}
                  onChange={() => update('terrain_mindset', opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Slopes and areas to avoid</label>
          <textarea rows={2} value={form.avoid_areas} onChange={(e) => update('avoid_areas', e.target.value)} />
        </div>
        <div className="field">
          <label>Route, with check-in stops</label>
          <Help>Note important precautions on the route.</Help>
          <textarea rows={3} value={form.route} onChange={(e) => update('route', e.target.value)} />
        </div>
        <div className="field">
          <label>Alternative route</label>
          <textarea rows={2} value={form.alternative_route} onChange={(e) => update('alternative_route', e.target.value)} />
        </div>
      </Section>

      <div className="row plan-actions">
        <button className="primary" type="submit">
          Save plan
        </button>
        <button type="button" onClick={handleSignOff} disabled={signedOff}>
          {signedOff ? 'Signed off' : 'Sign off plan'}
        </button>
      </div>
    </form>
  )
}
