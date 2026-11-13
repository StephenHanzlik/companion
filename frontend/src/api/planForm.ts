// "Plan Your Trip" form: the structure of the planning log. Modeled on the
// trip-planning checklist in a structured avalanche education field book.
// Persistence to the API is not wired yet; drafts live in the browser (see
// planStore.ts) until the plan data model is agreed.

export interface GroupMember {
  name: string
  contact: string
  emergency_contact: string
}

export interface CheckItem {
  checked: boolean
  notes: string
}

export const GROUP_CHECKS = [
  { key: 'goals', label: 'Goals are compatible' },
  { key: 'skills', label: 'Skills, abilities, and equipment are compatible' },
  { key: 'group_size', label: 'Group size discussed', help: 'Optimal group size is 3–5.' },
  { key: 'risk', label: 'Risk tolerance is compatible' },
  { key: 'health', label: 'Health issues discussed' },
  { key: 'agree', label: 'All agree to travel and decide together' },
] as const

export type GroupCheckKey = (typeof GROUP_CHECKS)[number]['key']

// Clockwise from north. The compass picker lays these out on a 3×3 grid.
export const ASPECTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const

export const ASPECT_NAMES: Record<string, string> = {
  N: 'North',
  NE: 'Northeast',
  E: 'East',
  SE: 'Southeast',
  S: 'South',
  SW: 'Southwest',
  W: 'West',
  NW: 'Northwest',
}

// Elevation bands as avalanche forecasts use them, highest first.
export const ELEVATION_BANDS = [
  { key: 'ALP', label: 'Above treeline' },
  { key: 'NTL', label: 'Near treeline' },
  { key: 'BTL', label: 'Below treeline' },
] as const

// Suggestions for the problem type field. Free text is still allowed.
export const PROBLEM_TYPES = [
  'Dry loose',
  'Wet loose',
  'Storm slab',
  'Wind slab',
  'Persistent slab',
  'Deep persistent slab',
  'Wet slab',
  'Cornice',
  'Glide',
]

export interface AvalancheProblem {
  problem_type: string
  size: string
  elevations: string[]
  aspects: string[]
  terrain_features: string
  danger_trend_timing: string
}

// Terrain mindset: pick a value, then describe the terrain choice. Wording is
// from the guidance page.
export const TERRAIN_MINDSETS = [
  {
    value: 'keep_it_simple',
    label: 'Keep it simple and avoid avalanche terrain',
    short: 'Keep it simple',
    description:
      'Low-angle or mostly forested terrain. No exposure; many options to reduce or remove exposure. If needed, cross runout zones one at a time.',
  },
  {
    value: 'limit_exposure',
    label: 'Limit exposure',
    short: 'Limit exposure',
    description:
      'Avoid the obvious paths, steepest slopes, and trigger zones. Example: enter slopes below start zones or low in the track; if unsure, avoid avalanche terrain. Watch for terrain traps, mid-slope start zones, overhead cornices, and less obvious slopes. Needs experience and careful route finding.',
  },
  {
    value: 'step_it_out_cautiously',
    label: 'Step it out cautiously',
    short: 'Step it out cautiously',
    description:
      'Lower risk by choosing terrain with less consequence. For days with low or no chance of avalanches. Terrain can be steep, open, and complex with many avalanche slopes; few options exist to reduce exposure.',
  },
] as const

export const TERRAIN_EXPOSURE_FOOTNOTE =
  'Based on the Avalanche Terrain Exposure Scale (Parks Canada).'

export const GEAR_ITEMS = [
  { key: 'food_water_layers', label: 'Food, water, warm layers' },
  { key: 'sos_device', label: 'SOS device (cell or satellite) and emergency numbers' },
  { key: 'evacuation_kit', label: 'Kit for evacuation and overnight emergency' },
  { key: 'first_aid', label: 'First aid kit' },
  { key: 'repair_kit', label: 'Repair and tool kit' },
  { key: 'navigation', label: 'Navigation tools' },
] as const

export type GearKey = (typeof GEAR_ITEMS)[number]['key']

export interface GearItem {
  checked: boolean
  // Name of the group member carrying the item, chosen from the group list.
  carried_by: string
}

// "Choose your terrain" summary checklist, attached to section 3.
export const STEP_C_ITEMS = [
  { key: 'route_recorded', label: "Agree on and record today's route" },
  { key: 'avoid_defined', label: 'Define slopes or areas to avoid' },
  { key: 'stops_noted', label: 'Note where you will stop, check in, and reassess' },
  { key: 'precautions', label: 'Discuss precautions and travel protocols for your terrain choices' },
  { key: 'alternative', label: 'Pick a realistic, less exposed alternative route' },
  { key: 'turnaround', label: 'Note turnaround point and time' },
] as const

export type StepCKey = (typeof STEP_C_ITEMS)[number]['key']

export interface PlanningForm {
  date: string
  group: GroupMember[]
  group_checks: Record<GroupCheckKey, CheckItem>
  weather_factors: string
  avalanche_problems: AvalancheProblem[]
  advisory_key_message: string
  terrain_mindset: string
  avoid_areas: string
  route: string
  alternative_route: string
  turnaround_point: string
  turnaround_time: string
  step_c_checks: Record<StepCKey, boolean>
  itinerary_shared_with: string
  gear: Record<GearKey, GearItem>
  confidence_statement: string
}

export const emptyMember = (): GroupMember => ({ name: '', contact: '', emergency_contact: '' })

export const emptyProblem = (): AvalancheProblem => ({
  problem_type: '',
  size: '',
  elevations: [],
  aspects: [],
  terrain_features: '',
  danger_trend_timing: '',
})

export const emptyPlanningForm = (): PlanningForm => ({
  date: '',
  group: [emptyMember()],
  group_checks: Object.fromEntries(
    GROUP_CHECKS.map((c) => [c.key, { checked: false, notes: '' }]),
  ) as Record<GroupCheckKey, CheckItem>,
  weather_factors: '',
  avalanche_problems: [emptyProblem()],
  advisory_key_message: '',
  terrain_mindset: '',
  avoid_areas: '',
  route: '',
  alternative_route: '',
  turnaround_point: '',
  turnaround_time: '',
  step_c_checks: Object.fromEntries(STEP_C_ITEMS.map((c) => [c.key, false])) as Record<StepCKey, boolean>,
  itinerary_shared_with: '',
  gear: Object.fromEntries(
    GEAR_ITEMS.map((g) => [g.key, { checked: false, carried_by: '' }]),
  ) as Record<GearKey, GearItem>,
  confidence_statement: '',
})

// --- Sections and progress ---------------------------------------------------

export type PlanSectionId = 'group' | 'hazard' | 'terrain' | 'emergency' | 'confidence'

export const PLAN_SECTIONS: { id: PlanSectionId; no: string; title: string; rule?: string }[] = [
  { id: 'group', no: '1.0', title: 'Assemble your group' },
  {
    id: 'hazard',
    no: '2.0',
    title: 'Anticipate the hazard',
    rule: 'Read the local avalanche advisory. Get expert opinion.',
  },
  {
    id: 'terrain',
    no: '3.0',
    title: 'Plan to manage avalanche terrain',
    rule: 'Decide by consensus. Voice all concerns. Respect any veto. Challenge assumptions.',
  },
  { id: 'emergency', no: '4.0', title: 'Discuss your emergency plan', rule: 'Assign group gear.' },
  { id: 'confidence', no: '5.0', title: 'Confidence and sign-off' },
]

const filled = (s: string) => s.trim().length > 0

export const namedMembers = (form: PlanningForm) => form.group.filter((m) => filled(m.name))

// A problem counts once it says what it is and where it is.
export const describedProblems = (form: PlanningForm) =>
  form.avalanche_problems.filter((p) => filled(p.problem_type) && p.aspects.length > 0 && p.elevations.length > 0)

// Each section's progress as items done out of items asked for. These mirror
// the prompts in the section, one point each.
export function sectionProgress(form: PlanningForm, id: PlanSectionId): { done: number; total: number } {
  const count = (xs: boolean[]) => ({ done: xs.filter(Boolean).length, total: xs.length })
  switch (id) {
    case 'group':
      return count([namedMembers(form).length > 0, ...GROUP_CHECKS.map((c) => form.group_checks[c.key].checked)])
    case 'hazard':
      return count([
        filled(form.weather_factors),
        describedProblems(form).length > 0,
        filled(form.advisory_key_message),
      ])
    case 'terrain':
      return count([
        filled(form.terrain_mindset),
        filled(form.avoid_areas),
        filled(form.route),
        filled(form.alternative_route),
        filled(form.turnaround_point) && filled(form.turnaround_time),
        ...STEP_C_ITEMS.map((c) => form.step_c_checks[c.key]),
      ])
    case 'emergency':
      return count([filled(form.itinerary_shared_with), ...GEAR_ITEMS.map((g) => form.gear[g.key].checked)])
    case 'confidence':
      return count([filled(form.confidence_statement)])
  }
}

export function planProgress(form: PlanningForm): { done: number; total: number } {
  return PLAN_SECTIONS.reduce(
    (acc, s) => {
      const p = sectionProgress(form, s.id)
      return { done: acc.done + p.done, total: acc.total + p.total }
    },
    { done: 0, total: 0 },
  )
}

export const mindsetShort = (value: string) => TERRAIN_MINDSETS.find((m) => m.value === value)?.short ?? ''

// Bring a stored draft up to the current shape, so older drafts keep loading
// as fields are added.
export function normalizePlanningForm(raw: unknown): PlanningForm {
  const base = emptyPlanningForm()
  if (!raw || typeof raw !== 'object') return base
  const r = raw as Partial<PlanningForm>
  return {
    ...base,
    ...r,
    group: Array.isArray(r.group) && r.group.length > 0 ? r.group.map((m) => ({ ...emptyMember(), ...m })) : base.group,
    group_checks: { ...base.group_checks, ...(r.group_checks ?? {}) },
    avalanche_problems: Array.isArray(r.avalanche_problems)
      ? r.avalanche_problems.map((p) => ({ ...emptyProblem(), ...p }))
      : base.avalanche_problems,
    step_c_checks: { ...base.step_c_checks, ...(r.step_c_checks ?? {}) },
    gear: { ...base.gear, ...(r.gear ?? {}) },
  }
}
