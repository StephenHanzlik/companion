import { useEffect, useId, useRef, useState } from 'react'
import {
  ASPECTS,
  AvalancheProblem,
  ELEVATION_BANDS,
  cellKey,
  GEAR_ITEMS,
  GROUP_CHECKS,
  GearKey,
  GroupCheckKey,
  GroupMember,
  PLAN_SECTIONS,
  PROBLEM_TYPES,
  PlanSectionId,
  PlanningForm,
  STEP_C_ITEMS,
  StepCKey,
  TERRAIN_EXPOSURE_FOOTNOTE,
  TERRAIN_MINDSETS,
  describedProblems,
  emptyMember,
  emptyProblem,
  mindsetShort,
  namedMembers,
  planProgress,
  sectionProgress,
} from '../api/planForm'
import { PlanDraft, loadPlanDraft, savePlanDraft } from '../api/planStore'
import { stateName } from '../api/states'
import { formatDate } from '../api/format'
import { Count, Field, Guide, SavedAt, SectionCard } from '../components/Form'
import Icon from '../components/Icon'
import { OverviewCard, OvList, OvNote, Progress } from '../components/Overview'
import Rose, { problemColor, roseLabel } from '../components/Rose'
import { PhaseFrame, PhaseProps } from './TripWorkspace'

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((x) => x !== value) : [...list, value]

function firstOpenSection(form: PlanningForm): PlanSectionId {
  const next = PLAN_SECTIONS.find((s) => {
    const p = sectionProgress(form, s.id)
    return p.done < p.total
  })
  return next?.id ?? 'confidence'
}

function sectionSummary(form: PlanningForm, id: PlanSectionId): string {
  switch (id) {
    case 'group': {
      const n = namedMembers(form).length
      const agreed = GROUP_CHECKS.filter((c) => form.group_checks[c.key].checked).length
      return n === 0 ? '' : `${n} ${n === 1 ? 'member' : 'members'} · ${agreed} of ${GROUP_CHECKS.length} discussed`
    }
    case 'hazard': {
      const names = describedProblems(form).map((p) => p.problem_type.trim())
      return names.length ? names.join(', ') : ''
    }
    case 'terrain': {
      const parts = [mindsetShort(form.terrain_mindset)]
      if (form.turnaround_time) parts.push(`turn around ${form.turnaround_time}`)
      return parts.filter(Boolean).join(' · ')
    }
    case 'emergency': {
      const gear = GEAR_ITEMS.filter((g) => form.gear[g.key].checked).length
      return gear ? `${gear} of ${GEAR_ITEMS.length} gear items covered` : ''
    }
    case 'confidence':
      return form.confidence_statement.trim().slice(0, 80)
  }
}

export default function PlanTab({ trip, sheet, header, onStatusChange, onGoTo }: PhaseProps) {
  const [draft, setDraft] = useState<PlanDraft>(() => loadPlanDraft(trip.id))
  const [open, setOpen] = useState<PlanSectionId | null>(() => firstOpenSection(loadPlanDraft(trip.id).form))
  const [saveFailed, setSaveFailed] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signError, setSignError] = useState<string | null>(null)
  const form = draft.form
  const ids = useId()

  // Autosave shortly after each change.
  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    const t = setTimeout(() => {
      const savedAt = new Date().toISOString()
      const ok = savePlanDraft(trip.id, { ...draft, form, savedAt })
      setSaveFailed(!ok)
      if (ok) setDraft((d) => ({ ...d, savedAt }))
    }, 450)
    return () => clearTimeout(t)
  }, [form])

  function update<K extends keyof PlanningForm>(key: K, value: PlanningForm[K]) {
    setDraft((d) => ({ ...d, form: { ...d.form, [key]: value } }))
  }

  // Group
  const setMember = (i: number, patch: Partial<GroupMember>) =>
    update('group', form.group.map((m, idx) => (idx === i ? { ...m, ...patch } : m)))
  const removeMember = (i: number) => update('group', form.group.filter((_, idx) => idx !== i))
  const setCheck = (key: GroupCheckKey, patch: Partial<PlanningForm['group_checks'][GroupCheckKey]>) =>
    update('group_checks', { ...form.group_checks, [key]: { ...form.group_checks[key], ...patch } })

  // Problems
  const setProblem = (i: number, patch: Partial<AvalancheProblem>) =>
    update('avalanche_problems', form.avalanche_problems.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))
  // Rose picking: single cells, a whole aspect wedge, or a whole band ring.
  const setCells = (i: number, cells: string[]) => setProblem(i, { cells })
  const toggleCells = (i: number, keys: string[]) => {
    const current = form.avalanche_problems[i].cells
    const allOn = keys.every((k) => current.includes(k))
    setCells(i, allOn ? current.filter((c) => !keys.includes(c)) : [...current, ...keys.filter((k) => !current.includes(k))])
  }
  const aspectCells = (aspect: string) => ELEVATION_BANDS.map((b) => cellKey(aspect, b.key))
  const bandCells = (band: string) => ASPECTS.map((a) => cellKey(a, band))
  const removeProblem = (i: number) =>
    update('avalanche_problems', form.avalanche_problems.filter((_, idx) => idx !== i))

  const setStepC = (key: StepCKey, checked: boolean) => update('step_c_checks', { ...form.step_c_checks, [key]: checked })
  const setGear = (key: GearKey, patch: Partial<PlanningForm['gear'][GearKey]>) =>
    update('gear', { ...form.gear, [key]: { ...form.gear[key], ...patch } })

  const memberNames = namedMembers(form).map((m) => m.name.trim())

  function go(id: PlanSectionId) {
    setOpen(id)
    requestAnimationFrame(() =>
      document.getElementById(`${ids}-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
  }

  async function signOff() {
    setSigning(true)
    setSignError(null)
    const signedOffAt = new Date().toISOString()
    const next = { ...draft, signedOffAt, savedAt: signedOffAt }
    if (!savePlanDraft(trip.id, next)) setSaveFailed(true)
    setDraft(next)
    try {
      if (trip.status === 'planning') await onStatusChange('active')
    } catch (e) {
      setSignError(`The plan is signed off, but the trip could not be moved to Ride: ${String(e)}`)
    } finally {
      setSigning(false)
    }
  }

  const total = planProgress(form)
  const order = PLAN_SECTIONS.map((s) => s.id)

  const footer = (id: PlanSectionId) => {
    const i = order.indexOf(id)
    const prev = order[i - 1]
    const next = PLAN_SECTIONS[i + 1]
    return (
      <>
        {saveFailed ? (
          <span className="saved saved-error">Couldn’t save in this browser. Keep this tab open.</span>
        ) : (
          <SavedAt at={draft.savedAt} where="this browser" />
        )}
        <div className="btn-row">
          {prev && (
            <button type="button" className="btn btn-quiet" onClick={() => go(prev)}>
              Back
            </button>
          )}
          {next && (
            <button type="button" className="btn btn-primary" onClick={() => go(next.id)}>
              Continue to {next.no}
              <Icon name="arrow-right" size={14} />
            </button>
          )}
        </div>
      </>
    )
  }

  const problems = form.avalanche_problems
    .map((p, i) => ({ p, color: problemColor(i) }))
    .filter(({ p }) => p.problem_type.trim() && p.cells.length > 0)

  const aside = (
    <OverviewCard
      label="Plan overview"
      title={trip.title}
      meta={<><span className="mono">Sheet {sheet}</span> · {stateName(trip.state) ?? 'No state'} · {trip.start_date ? formatDate(trip.start_date) : 'No date'}</>}
    >
      <Progress
        steps={PLAN_SECTIONS.map((s) => {
          const p = sectionProgress(form, s.id)
          if (p.total > 0 && p.done === p.total) return 'done'
          return s.id === open ? 'current' : 'ahead'
        })}
        label="Plan"
        value={`${total.done} of ${total.total}`}
      />
      <OvList
        rows={[
          {
            label: 'Party',
            value: memberNames.length ? `${memberNames.length} ${memberNames.length === 1 ? 'member' : 'members'}` : 'Not set',
            empty: memberNames.length === 0,
          },
          {
            label: 'Signed off',
            value: draft.signedOffAt ? formatDate(draft.signedOffAt.slice(0, 10)) : 'Not yet',
            empty: !draft.signedOffAt,
          },
        ]}
      />
      <div className="ov-roses">
        {problems.length === 0 ? (
          <p className="ov-empty">Avalanche problems from 2.0 appear here by aspect and elevation.</p>
        ) : (
          <>
            <div className="ov-rose-grid">
              {problems.map(({ p, color }, i) => (
                <figure key={i} className="ov-rose">
                  <Rose cells={p.cells} color={color} />
                  <figcaption>
                    <i style={{ background: color }} aria-hidden="true" />
                    {p.problem_type}
                  </figcaption>
                </figure>
              ))}
            </div>
            <ul className="ov-legend" aria-label="Rings, from the center out">
              {ELEVATION_BANDS.map((b, i) => (
                <li key={b.key}>
                  <i className={`band-${i}`} aria-hidden="true" />
                  {['Above', 'Near', 'Below treeline'][i]}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <OvList
        rows={[
          { label: 'Terrain mindset', value: mindsetShort(form.terrain_mindset) || 'Not set', empty: !form.terrain_mindset },
          {
            label: 'Turnaround',
            value: [form.turnaround_time, form.turnaround_point].filter(Boolean).join(' · ') || 'Not set',
            empty: !form.turnaround_time && !form.turnaround_point,
          },
          { label: 'Itinerary shared', value: form.itinerary_shared_with || 'Not set', empty: !form.itinerary_shared_with },
        ]}
      />
      <OvNote>From your plan entries. Not a hazard rating.</OvNote>
    </OverviewCard>
  )

  const section = (id: PlanSectionId) => PLAN_SECTIONS.find((s) => s.id === id)!
  const cardProps = (id: PlanSectionId) => {
    const s = section(id)
    const p = sectionProgress(form, id)
    return {
      no: s.no,
      title: s.title,
      rule: s.rule,
      links: s.links,
      status: <Count done={p.done} total={p.total} />,
      summary: sectionSummary(form, id),
      open: open === id,
      onOpen: () => setOpen(open === id ? null : id),
      footer: footer(id),
    }
  }

  return (
    <PhaseFrame header={header} aside={aside}>
      <div className="stack">
        {/* 1.0 Group */}
        <div id={`${ids}-group`} className="anchor">
          <SectionCard {...cardProps('group')}>
            <h3 className="subhead">Group check-in</h3>
            <div className="table-wrap">
              <table className="table table-inputs">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Contact</th>
                    <th scope="col">Emergency contact</th>
                    <th scope="col">
                      <span className="sr-only">Remove</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {form.group.map((m, i) => (
                    <tr key={i}>
                      <td>
                        <input className="input" aria-label={`Member ${i + 1} name`} value={m.name} onChange={(e) => setMember(i, { name: e.target.value })} />
                      </td>
                      <td>
                        <input className="input" aria-label={`Member ${i + 1} contact`} value={m.contact} onChange={(e) => setMember(i, { contact: e.target.value })} />
                      </td>
                      <td>
                        <input
                          className="input"
                          aria-label={`Member ${i + 1} emergency contact`}
                          value={m.emergency_contact}
                          onChange={(e) => setMember(i, { emergency_contact: e.target.value })}
                        />
                      </td>
                      <td className="cell-action">
                        {form.group.length > 1 && (
                          <button type="button" className="icon-btn" aria-label={`Remove ${m.name || `member ${i + 1}`}`} onClick={() => removeMember(i)}>
                            <Icon name="x" size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="btn btn-dashed" onClick={() => update('group', [...form.group, emptyMember()])}>
              <Icon name="plus" size={14} />
              Add member
            </button>

            <h3 className="subhead">Group discussion</h3>
            <ul className="checklist">
              {GROUP_CHECKS.map((c) => (
                <li key={c.key} className="checklist-row">
                  <label className="check">
                    <input type="checkbox" checked={form.group_checks[c.key].checked} onChange={(e) => setCheck(c.key, { checked: e.target.checked })} />
                    <span>
                      {c.label}
                      {'help' in c && <span className="check-help">{c.help}</span>}
                    </span>
                  </label>
                  <input
                    className="input input-sm"
                    placeholder="Notes"
                    aria-label={`Notes: ${c.label}`}
                    value={form.group_checks[c.key].notes}
                    onChange={(e) => setCheck(c.key, { notes: e.target.value })}
                  />
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        {/* 2.0 Hazard */}
        <div id={`${ids}-hazard`} className="anchor">
          <SectionCard {...cardProps('hazard')}>
            <Field label="Weather factors" help="— snowfall, wind, drifting snow, warming" htmlFor={`${ids}-wx`}>
              <textarea id={`${ids}-wx`} className="input" rows={3} value={form.weather_factors} onChange={(e) => update('weather_factors', e.target.value)} />
            </Field>

            <div className="field-label-row">
              <h3 className="field-label">Avalanche problems</h3>
              <Guide title="What the fields mean">
                <ul>
                  <li>
                    <strong>The rose:</strong> each wedge is an aspect, the direction a slope faces. The rings are
                    elevation bands: the center is above treeline (ALP), the middle near treeline (NTL), and the outside
                    below treeline (BTL). Click every cell the advisory names; a letter selects its whole wedge, and the
                    ALP, NTL, and BTL buttons select a whole ring.
                  </li>
                  <li>
                    <strong>Size:</strong> destructive size, from D1 (relatively harmless to people) to D5 (largest known).
                  </li>

                </ul>
              </Guide>
            </div>
            <datalist id={`${ids}-types`}>
              {PROBLEM_TYPES.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
            <div className="problems">
              {form.avalanche_problems.map((p, i) => (
                <div key={i} className="problem">
                  <div className="problem-key">
                    <span className="mono">{i + 1}</span>
                    <i style={{ background: problemColor(i) }} aria-hidden="true" />
                  </div>
                  <div className="problem-fields">
                    <Field label="Type" htmlFor={`${ids}-pt-${i}`}>
                      <input
                        id={`${ids}-pt-${i}`}
                        className="input"
                        list={`${ids}-types`}
                        placeholder="e.g. Wind slab"
                        value={p.problem_type}
                        onChange={(e) => setProblem(i, { problem_type: e.target.value })}
                      />
                    </Field>
                    <Field label="Size" htmlFor={`${ids}-ps-${i}`}>
                      <input id={`${ids}-ps-${i}`} className="input" placeholder="D2" value={p.size} onChange={(e) => setProblem(i, { size: e.target.value })} />
                    </Field>
                    <Field label="Terrain features" htmlFor={`${ids}-pf-${i}`} className="span-2">
                      <input
                        id={`${ids}-pf-${i}`}
                        className="input"
                        placeholder="e.g. Lee of ridgelines, gullies"
                        value={p.terrain_features}
                        onChange={(e) => setProblem(i, { terrain_features: e.target.value })}
                      />
                    </Field>
                    <Field label="Trend & timing" htmlFor={`${ids}-pd-${i}`} className="span-2">
                      <input
                        id={`${ids}-pd-${i}`}
                        className="input"
                        placeholder="e.g. Rising with afternoon wind"
                        value={p.danger_trend_timing}
                        onChange={(e) => setProblem(i, { danger_trend_timing: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="problem-where">
                    <span className="field-label">
                      Where <span className="field-help">— click the rose</span>
                    </span>
                    <Rose
                      className="rose-picker"
                      cells={p.cells}
                      color={problemColor(i)}
                      label={`Problem ${i + 1}: aspects and elevation bands`}
                      onToggle={(cell) => setCells(i, toggle(p.cells, cell))}
                      onToggleAspect={(a) => toggleCells(i, aspectCells(a))}
                    />
                    <div className="band-toggles" role="group" aria-label="Whole elevation bands">
                      {ELEVATION_BANDS.map((b, bi) => (
                        <button
                          key={b.key}
                          type="button"
                          className="chip band-chip"
                          aria-pressed={bandCells(b.key).every((c) => p.cells.includes(c))}
                          title={`Every aspect ${b.label.toLowerCase()}`}
                          onClick={() => toggleCells(i, bandCells(b.key))}
                        >
                          <i className={`band-${bi}`} aria-hidden="true" />
                          {b.key}
                        </button>
                      ))}
                      <button type="button" className="link-btn band-clear" disabled={p.cells.length === 0} onClick={() => setCells(i, [])}>
                        Clear
                      </button>
                    </div>
                    <p className="rose-summary" aria-live="polite">
                      {p.cells.length ? roseLabel(p.cells) : 'Nothing selected yet.'}
                    </p>
                  </div>
                  {form.avalanche_problems.length > 1 && (
                    <button type="button" className="icon-btn problem-remove" aria-label={`Remove problem ${i + 1}`} onClick={() => removeProblem(i)}>
                      <Icon name="x" size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-dashed"
              onClick={() => update('avalanche_problems', [...form.avalanche_problems, emptyProblem()])}
            >
              <Icon name="plus" size={14} />
              Add problem
            </button>

            <Field label="Advisory key message" help="— recent avalanches and travel advice" htmlFor={`${ids}-km`} className="field-gap">
              <textarea id={`${ids}-km`} className="input" rows={3} value={form.advisory_key_message} onChange={(e) => update('advisory_key_message', e.target.value)} />
            </Field>
          </SectionCard>
        </div>

        {/* 3.0 Terrain */}
        <div id={`${ids}-terrain`} className="anchor">
          <SectionCard {...cardProps('terrain')}>
            <fieldset className="field">
              <legend className="field-label">Today’s terrain mindset</legend>
              <Guide>
                <ul>
                  <li>When danger is elevated, choose less exposed terrain.</li>
                  <li>When terrain or conditions are unfamiliar, or the group is unsure, choose less exposed terrain.</li>
                  <li>Think about going with an expert who can manage current conditions and more complex terrain.</li>
                </ul>
              </Guide>
              <div className="options">
                {TERRAIN_MINDSETS.map((m) => (
                  <label key={m.value} className="option">
                    <input
                      type="radio"
                      name={`${ids}-mindset`}
                      value={m.value}
                      checked={form.terrain_mindset === m.value}
                      onChange={() => update('terrain_mindset', m.value)}
                    />
                    <span>
                      <strong>{m.label}</strong>
                      <span className="option-desc">{m.description}</span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="footnote">{TERRAIN_EXPOSURE_FOOTNOTE}</p>
            </fieldset>

            <Field label="Slopes and areas to avoid" htmlFor={`${ids}-avoid`}>
              <textarea id={`${ids}-avoid`} className="input" rows={2} value={form.avoid_areas} onChange={(e) => update('avoid_areas', e.target.value)} />
            </Field>
            <Field label="Route, with check-in stops" help="— note important precautions" htmlFor={`${ids}-route`}>
              <Guide title="Discuss route options">
                <p>Discuss route options for today’s group, weather, and avalanche concerns.</p>
                <ul>
                  <li>Use maps, photos, and guidebooks to find avalanche slopes on the route.</li>
                  <li>Find terrain with less exposure and less consequence.</li>
                  <li>Think about your time plan in relation to the hazard.</li>
                </ul>
              </Guide>
              <textarea id={`${ids}-route`} className="input" rows={3} value={form.route} onChange={(e) => update('route', e.target.value)} />
            </Field>
            <Field label="Alternative route" htmlFor={`${ids}-alt`}>
              <textarea id={`${ids}-alt`} className="input" rows={2} value={form.alternative_route} onChange={(e) => update('alternative_route', e.target.value)} />
            </Field>
            <div className="grid-2">
              <Field label="Turnaround point" htmlFor={`${ids}-tp`}>
                <input id={`${ids}-tp`} className="input" value={form.turnaround_point} onChange={(e) => update('turnaround_point', e.target.value)} />
              </Field>
              <Field label="Turnaround time" htmlFor={`${ids}-tt`}>
                <input id={`${ids}-tt`} className="input" type="time" value={form.turnaround_time} onChange={(e) => update('turnaround_time', e.target.value)} />
              </Field>
            </div>

            <h3 className="subhead">Choose your terrain</h3>
            <p className="help">Acknowledge consequences. Have an alternative plan.</p>
            <ul className="checklist">
              {STEP_C_ITEMS.map((c) => (
                <li key={c.key} className="checklist-row checklist-row-single">
                  <label className="check">
                    <input type="checkbox" checked={form.step_c_checks[c.key]} onChange={(e) => setStepC(c.key, e.target.checked)} />
                    <span>{c.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        {/* 4.0 Emergency */}
        <div id={`${ids}-emergency`} className="anchor">
          <SectionCard {...cardProps('emergency')}>
            <Field label="Who else has our itinerary?" htmlFor={`${ids}-itin`}>
              <input id={`${ids}-itin`} className="input" value={form.itinerary_shared_with} onChange={(e) => update('itinerary_shared_with', e.target.value)} />
            </Field>
            <h3 className="subhead">Group gear</h3>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Item</th>
                    <th scope="col">Carried by</th>
                  </tr>
                </thead>
                <tbody>
                  {GEAR_ITEMS.map((g) => (
                    <tr key={g.key}>
                      <td>
                        <label className="check">
                          <input type="checkbox" checked={form.gear[g.key].checked} onChange={(e) => setGear(g.key, { checked: e.target.checked })} />
                          <span>{g.label}</span>
                        </label>
                      </td>
                      <td className="cell-select">
                        <select
                          className="input"
                          aria-label={`Who carries: ${g.label}`}
                          value={form.gear[g.key].carried_by}
                          onChange={(e) => setGear(g.key, { carried_by: e.target.value })}
                        >
                          <option value="">{memberNames.length ? 'Choose a member' : 'Add members in 1.0'}</option>
                          {memberNames.map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        {/* 5.0 Confidence and sign-off */}
        <div id={`${ids}-confidence`} className="anchor">
          <SectionCard
            {...cardProps('confidence')}
            footer={
              <>
                <SavedAt at={draft.savedAt} where="this browser" />
                <div className="btn-row">
                  {draft.signedOffAt ? (
                    <button type="button" className="btn btn-primary" onClick={() => onGoTo('ride')}>
                      Go to Ride
                      <Icon name="arrow-right" size={14} />
                    </button>
                  ) : (
                    <button type="button" className="btn btn-accent" onClick={signOff} disabled={signing}>
                      {signing ? 'Signing off…' : 'Sign off plan'}
                    </button>
                  )}
                </div>
              </>
            }
          >
            <Field label="What gives us the confidence to carry out this plan?" htmlFor={`${ids}-conf`}>
              <textarea
                id={`${ids}-conf`}
                className="input"
                rows={3}
                value={form.confidence_statement}
                onChange={(e) => update('confidence_statement', e.target.value)}
              />
            </Field>
            {draft.signedOffAt ? (
              <p className="callout callout-ok">
                <Icon name="check" size={15} />
                Signed off {formatDate(draft.signedOffAt.slice(0, 10))}. Copy the essentials into your field book before you leave.
              </p>
            ) : (
              <p className="help">
                Signing off moves the trip to Ride. You can keep editing the plan afterwards.
                {total.done < total.total && ` ${total.total - total.done} items are still open.`}
              </p>
            )}
            {signError && <p className="callout callout-error">{signError}</p>}
          </SectionCard>
        </div>
      </div>
    </PhaseFrame>
  )
}
