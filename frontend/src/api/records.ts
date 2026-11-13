import type { Observation, ObservationType, SnowProfileTest, SnowTestType, Trip, TripStatus } from './types'

// --- Trips -------------------------------------------------------------------

export type Phase = 'plan' | 'ride' | 'debrief'

export const PHASES: { id: Phase; label: string; status: TripStatus; statusLabel: string }[] = [
  { id: 'plan', label: 'Plan', status: 'planning', statusLabel: 'Planning' },
  { id: 'ride', label: 'Ride', status: 'active', statusLabel: 'Ride' },
  { id: 'debrief', label: 'Debrief', status: 'debriefed', statusLabel: 'Debriefed' },
]

export const phaseOf = (status: TripStatus | string | null | undefined): Phase =>
  PHASES.find((p) => p.status === status)?.id ?? 'plan'

export const phaseLabel = (status: TripStatus | string | null | undefined) =>
  PHASES.find((p) => p.status === status)?.statusLabel ?? 'Planning'

// Sheet numbers count trips in the order they were created: 001, 002, …
// Derived on the client so nothing new needs storing.
export function sheetNumbers(trips: Trip[]): Map<string, string> {
  const ordered = [...trips].sort((a, b) => a.created_at.localeCompare(b.created_at))
  return new Map(ordered.map((t, i) => [t.id, String(i + 1).padStart(3, '0')]))
}

export const isInProgress = (t: Trip) => t.status !== 'debriefed'

// --- Field record ------------------------------------------------------------

// Location name, relevance, and other small extras ride in the existing JSON
// columns (observations.data, snow_profile_tests.results) until they get real
// columns.
export interface FieldContext {
  location_name?: string
  relevance?: string
  kind?: string
  result?: string
}

export const contextOf = (json: unknown): FieldContext =>
  json && typeof json === 'object' ? (json as FieldContext) : {}

export const OBSERVATION_TYPES: { value: ObservationType; label: string }[] = [
  { value: 'avalanche', label: 'Avalanche' },
  { value: 'red_flag', label: 'Red flag' },
  { value: 'weather', label: 'Weather' },
  { value: 'terrain', label: 'Terrain' },
  { value: 'general', label: 'General' },
]

export const SNOW_TEST_TYPES: { value: SnowTestType; label: string; short: string; help?: string }[] = [
  { value: 'extended_column_test', label: 'Extended column test', short: 'ECT', help: 'e.g. ECTP 14 (propagated on tap 14)' },
  { value: 'compression_test', label: 'Compression test', short: 'CT', help: 'e.g. CT 18 Q2 (tap 18, planar fracture)' },
  { value: 'propagation_saw_test', label: 'Propagation saw test', short: 'PST', help: 'e.g. PST 45/100 End' },
  { value: 'pit_profile', label: 'Pit profile', short: 'Pit' },
  { value: 'other', label: 'Other', short: 'Other' },
]

export const FIELD_NOTE_KINDS = [
  { value: 'plan_change', label: 'Plan change' },
  { value: 'tactic', label: 'Tactic used to reduce risk' },
] as const

export type EntryKind = 'observation' | 'test' | 'note'

export interface FieldEntry {
  id: string
  kind: EntryKind
  code: string
  at: string
  badges: { label: string; tone?: 'flag' }[]
  title: string
  body?: string
  where?: string
  why?: string
  facts?: { label: string; value: string }[]
}

const firstLine = (s: string | null | undefined) => (s ?? '').split('\n')[0].trim()

// Merges observations, snow tests, and field notes into one timeline with
// stable codes (OBS-01, TEST-01, NOTE-01) in the order they happened.
export function buildFieldRecord(observations: Observation[], tests: SnowProfileTest[]): FieldEntry[] {
  const entries: Omit<FieldEntry, 'code'>[] = []

  for (const o of observations) {
    const ctx = contextOf(o.data)
    if (ctx.kind) {
      const kind = FIELD_NOTE_KINDS.find((k) => k.value === ctx.kind)
      entries.push({
        id: o.id,
        kind: 'note',
        at: o.observed_at,
        badges: [{ label: kind?.label ?? 'Note' }],
        title: firstLine(o.notes) || 'Field note',
        body: (o.notes ?? '').split('\n').slice(1).join('\n').trim() || undefined,
      })
      continue
    }
    const type = OBSERVATION_TYPES.find((t) => t.value === o.observation_type)
    entries.push({
      id: o.id,
      kind: 'observation',
      at: o.observed_at,
      badges: [{ label: type?.label ?? 'Observation', tone: o.observation_type === 'red_flag' ? 'flag' : undefined }],
      title: firstLine(o.notes) || `${type?.label ?? 'General'} observation`,
      body: (o.notes ?? '').split('\n').slice(1).join('\n').trim() || undefined,
      where: ctx.location_name,
      why: ctx.relevance,
    })
  }

  for (const t of tests) {
    const ctx = contextOf(t.results)
    const type = SNOW_TEST_TYPES.find((x) => x.value === t.test_type)
    const facts: { label: string; value: string }[] = []
    if (t.aspect) facts.push({ label: 'Aspect', value: t.aspect })
    if (t.slope_angle_deg != null) facts.push({ label: 'Slope', value: `${t.slope_angle_deg}°` })
    if (t.elevation_m != null) facts.push({ label: 'Elevation', value: `${Math.round(t.elevation_m * 3.28084).toLocaleString()} ft` })
    entries.push({
      id: t.id,
      kind: 'test',
      at: t.recorded_at,
      badges: [{ label: type?.label ?? 'Snow test' }],
      title: ctx.result || firstLine(t.notes) || type?.label || 'Snow test',
      body: ctx.result ? t.notes ?? undefined : undefined,
      where: ctx.location_name,
      why: ctx.relevance,
      facts,
    })
  }

  entries.sort((a, b) => a.at.localeCompare(b.at))
  const counters: Record<EntryKind, number> = { observation: 0, test: 0, note: 0 }
  const prefix: Record<EntryKind, string> = { observation: 'OBS', test: 'TEST', note: 'NOTE' }
  return entries.map((e) => {
    counters[e.kind] += 1
    return { ...e, code: `${prefix[e.kind]}-${String(counters[e.kind]).padStart(2, '0')}` }
  })
}

// --- Time helpers ------------------------------------------------------------

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })

export const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

// A datetime-local value (YYYY-MM-DDTHH:mm) for the trip's first day at the
// given time, falling back to today.
export function defaultEntryTime(startDate: string | null, time = '09:00'): string {
  const d = new Date()
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return `${startDate ?? today}T${time}`
}

export const localInputToIso = (value: string) => (value ? new Date(value).toISOString() : undefined)
