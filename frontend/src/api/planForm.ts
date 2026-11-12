// "Plan Your Trip" form: the structure of the planning log. Modeled on the
// trip-planning checklist in a structured avalanche education field book.
// Shape is final for the UI; persistence is not wired yet (see PlanTab).

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

export const ASPECTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const

export interface AvalancheProblem {
  problem_type: string
  size: string
  elevation: string
  aspects: string[]
  terrain_features: string
  danger_trend_timing: string
}

// TODO: the three mindset options come from the guidance page, which hasn't
// been provided yet. Replace these labels with the real wording.
export const TERRAIN_MINDSETS = [
  { value: 'mindset_1', label: 'Mindset option 1 (to confirm)' },
  { value: 'mindset_2', label: 'Mindset option 2 (to confirm)' },
  { value: 'mindset_3', label: 'Mindset option 3 (to confirm)' },
] as const

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
}

export const emptyMember = (): GroupMember => ({ name: '', contact: '', emergency_contact: '' })

export const emptyProblem = (): AvalancheProblem => ({
  problem_type: '',
  size: '',
  elevation: '',
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
  avalanche_problems: [emptyProblem(), emptyProblem()],
  advisory_key_message: '',
  terrain_mindset: '',
  avoid_areas: '',
  route: '',
  alternative_route: '',
})
