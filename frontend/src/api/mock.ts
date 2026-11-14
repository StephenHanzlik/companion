import type { Api } from './client'
import type { Debrief, Observation, Plan, SnowProfileTest, Trip, WeatherSummary } from './types'
import { emptyPlanningForm, PlanningForm } from './planForm'
import { hasPlanDraft, savePlanDraft } from './planStore'

// In-browser stand-in for the REST API, used by `npm run dev:mock` so the
// frontend can be iterated on without the backend. Data is sample data and
// persists in localStorage until "companion.mock.v1" is cleared.

const USER = '00000000-0000-0000-0000-000000000001'
const STORE_KEY = 'companion.mock.v1'

interface Db {
  trips: Trip[]
  observations: Observation[]
  tests: SnowProfileTest[]
  debriefs: Debrief[]
}

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}-${Date.now()}`

const nowIso = () => new Date().toISOString()

function trip(id: string, title: string, state: string, date: string, status: Trip['status'], created: string): Trip {
  return {
    id,
    owner_id: USER,
    title,
    state,
    status,
    start_date: date,
    end_date: date,
    created_at: created,
    updated_at: created,
  }
}

function obs(trip_id: string, type: Observation['observation_type'], at: string, notes: string, data: object): Observation {
  return {
    id: uid(),
    trip_id,
    created_by: USER,
    observation_type: type,
    observed_at: at,
    latitude: null,
    longitude: null,
    elevation_m: null,
    notes,
    data,
    created_at: at,
  }
}

function seed(): Db {
  const t1 = 'mock-trip-snoqualmie'
  const t2 = 'mock-trip-red-mountain'
  const t3 = 'mock-trip-teton'
  const t4 = 'mock-trip-loveland'
  const t5 = 'mock-trip-berthoud'
  const trips = [
    trip(t1, 'Snoqualmie Pass — Source Lake', 'WA', '2026-02-02', 'debriefed', '2026-01-28T19:00:00Z'),
    trip(t2, 'Red Mountain Pass — Hayden', 'CO', '2026-02-21', 'debriefed', '2026-02-17T02:10:00Z'),
    trip(t3, 'Teton Pass — Glory Bowl', 'WY', '2026-03-14', 'debriefed', '2026-03-10T01:30:00Z'),
    trip(t4, 'Loveland Pass — Dry Gulch', 'CO', '2026-11-08', 'active', '2026-11-04T03:00:00Z'),
    trip(t5, 'Berthoud Pass — Current Creek', 'CO', '2026-11-21', 'planning', '2026-11-12T02:45:00Z'),
  ]

  const observations: Observation[] = [
    obs(t4, 'weather', '2026-11-08T15:40:00Z', 'Light snow, W wind moving snow at ridgetop', {
      location_name: 'Trailhead, 11,990 ft',
      relevance: 'Active loading on east-facing slopes through the morning.',
    }),
    obs(t4, 'red_flag', '2026-11-08T17:42:00Z', 'Shooting cracks on a wind-loaded rollover', {
      location_name: 'Below the ridge, NE side of Dry Gulch, about 11,400 ft',
      relevance: 'Matches the wind slab problem. We avoided similar slopes for the rest of the day.',
    }),
    obs(t4, 'general', '2026-11-08T19:05:00Z', 'Turned around at the first bench\nGroup consensus after the test result. Took the treed alternative down.', {
      kind: 'plan_change',
    }),
  ]
  const tests: SnowProfileTest[] = [
    {
      id: uid(),
      trip_id: t4,
      observation_id: null,
      created_by: USER,
      test_type: 'extended_column_test',
      recorded_at: '2026-11-08T18:20:00Z',
      latitude: null,
      longitude: null,
      elevation_m: 3429,
      aspect: 'NE',
      slope_angle_deg: 32,
      results: { result: 'ECTP 14 down 40 cm', location_name: 'Test slope above the first bench', relevance: 'Propagation on the early-season facets.' },
      notes: 'Clean, planar failure on facets above the November crust.',
      created_at: '2026-11-08T18:20:00Z',
    },
  ]

  const debrief = (trip_id: string, summary: string, lessons: string, at: string): Debrief => ({
    id: uid(),
    trip_id,
    summary,
    decision_reflections: [],
    lessons_learned: lessons,
    submitted_at: at,
    created_at: at,
    updated_at: at,
  })
  const debriefs = [
    debrief(t1, 'Low-angle laps in the trees around Source Lake in poor visibility.', 'Bring a better plan for flat light; we wasted an hour route finding.', '2026-02-03T04:00:00Z'),
    debrief(t2, 'Toured Hayden to the ridge, skied the east trees.', 'Our turnaround time held up. Keep setting it at the trailhead.', '2026-02-22T03:20:00Z'),
    debrief(t3, 'Glory Bowl skin track, skied Twin Slides only after watching the slope.', 'Talk through the escape route before dropping in, not after.', '2026-03-15T02:00:00Z'),
  ]

  // A half-finished plan for the upcoming trip, so the Plan tab has something
  // to show on first run.
  if (!hasPlanDraft(t5)) {
    const form: PlanningForm = emptyPlanningForm()
    form.group = [
      { name: 'Sam', contact: '555-0132', emergency_contact: 'Alex · 555-0177' },
      { name: 'Jordan', contact: '555-0148', emergency_contact: 'Riley · 555-0109' },
      { name: 'Casey', contact: '555-0161', emergency_contact: 'Morgan · 555-0120' },
      { name: 'Taylor', contact: '555-0193', emergency_contact: 'Jamie · 555-0115' },
    ]
    for (const k of Object.keys(form.group_checks) as (keyof PlanningForm['group_checks'])[]) {
      form.group_checks[k].checked = true
    }
    form.weather_factors =
      '8–12 in. new since Thursday. W–NW winds 20–30 mph at ridgetop Friday night, easing Saturday afternoon.'
    form.avalanche_problems = [
      {
        problem_type: 'Wind slab',
        size: 'D1.5–2',
        cells: ['N:ALP', 'NE:ALP', 'E:ALP', 'NE:NTL', 'E:NTL'],
        terrain_features: 'Lee of ridgelines, cross-loaded gullies',
        danger_trend_timing: "Rising with Friday's wind",
      },
      {
        problem_type: 'Persistent slab',
        size: 'D2',
        cells: ['NW:NTL', 'N:NTL', 'NE:NTL', 'N:BTL'],
        terrain_features: 'Shallow, rocky areas',
        danger_trend_timing: 'Steady; slow to heal',
      },
    ]
    form.advisory_key_message =
      'Two natural D2 avalanches on N aspects near treeline Tuesday. Avoid wind-loaded slopes steeper than 35°.'
    form.terrain_mindset = 'limit_exposure'
    form.route = 'Skin the Current Creek trail to the second bench. Check in at the first bench.'
    savePlanDraft(t5, { form, savedAt: '2026-11-13T04:14:00Z', signedOffAt: null })
  }
  if (!hasPlanDraft(t4)) {
    const form = emptyPlanningForm()
    form.group = [
      { name: 'Sam', contact: '', emergency_contact: '' },
      { name: 'Casey', contact: '', emergency_contact: '' },
      { name: 'Jordan', contact: '', emergency_contact: '' },
    ]
    form.avalanche_problems = [
      { problem_type: 'Wind slab', size: 'D1.5', cells: ['NE:ALP', 'E:ALP', 'SE:ALP', 'E:NTL'], terrain_features: '', danger_trend_timing: '' },
      { problem_type: 'Persistent slab', size: 'D2', cells: ['N:NTL', 'NE:NTL', 'N:BTL'], terrain_features: '', danger_trend_timing: '' },
    ]
    form.terrain_mindset = 'keep_it_simple'
    form.turnaround_point = 'Second bench'
    form.turnaround_time = '13:00'
    savePlanDraft(t4, { form, savedAt: '2026-11-07T03:00:00Z', signedOffAt: '2026-11-07T03:05:00Z' })
  }

  return { trips, observations, tests, debriefs }
}

function load(): Db {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return JSON.parse(raw) as Db
  } catch {
    // fall through to a fresh seed
  }
  const db = seed()
  persist(db)
  return db
}

function persist(db: Db) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(db))
  } catch {
    // Storage unavailable: the mock still works for this page load.
  }
}

let db: Db | null = null
const getDb = () => (db ??= load())

const delay = <T>(value: T, ms = 120): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms))

const notFound = (what: string) => Promise.reject(new Error(`404 Not Found: no ${what}`))

function tripOr404(id: string) {
  return getDb().trips.find((t) => t.id === id)
}

export const mockApi: Api = {
  listTrips: () => delay([...getDb().trips].sort((a, b) => b.created_at.localeCompare(a.created_at))),
  createTrip: (input) => {
    const t: Trip = {
      id: uid(),
      owner_id: USER,
      title: input.title,
      state: input.state,
      status: 'planning',
      start_date: input.start_date ?? null,
      end_date: input.end_date ?? null,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    getDb().trips.push(t)
    persist(getDb())
    return delay(t)
  },
  getTrip: (tripId) => {
    const t = tripOr404(tripId)
    return t ? delay(t) : notFound('trip')
  },
  updateTripStatus: (tripId, status) => {
    const t = tripOr404(tripId)
    if (!t) return notFound('trip')
    t.status = status as Trip['status']
    t.updated_at = nowIso()
    persist(getDb())
    return delay(t)
  },

  getPlan: () => notFound('plan') as Promise<Plan>,
  upsertPlan: () => Promise.reject(new Error('Plan persistence is not wired in the mock API')),
  signOffPlan: () => Promise.reject(new Error('Plan persistence is not wired in the mock API')),

  listObservations: (tripId) => delay(getDb().observations.filter((o) => o.trip_id === tripId)),
  createObservation: (tripId, input) => {
    const at = (input.observed_at as string | undefined) ?? nowIso()
    const o: Observation = {
      id: uid(),
      trip_id: tripId,
      created_by: USER,
      observation_type: (input.observation_type as Observation['observation_type']) ?? 'general',
      observed_at: at,
      latitude: (input.latitude as number | undefined) ?? null,
      longitude: (input.longitude as number | undefined) ?? null,
      elevation_m: (input.elevation_m as number | undefined) ?? null,
      notes: (input.notes as string | undefined) ?? null,
      data: input.data ?? null,
      created_at: nowIso(),
    }
    getDb().observations.push(o)
    persist(getDb())
    return delay(o)
  },

  listSnowTests: (tripId) => delay(getDb().tests.filter((t) => t.trip_id === tripId)),
  createSnowTest: (tripId, input) => {
    const t: SnowProfileTest = {
      id: uid(),
      trip_id: tripId,
      observation_id: null,
      created_by: USER,
      test_type: (input.test_type as SnowProfileTest['test_type']) ?? 'other',
      recorded_at: (input.recorded_at as string | undefined) ?? nowIso(),
      latitude: (input.latitude as number | undefined) ?? null,
      longitude: (input.longitude as number | undefined) ?? null,
      elevation_m: (input.elevation_m as number | undefined) ?? null,
      aspect: (input.aspect as string | undefined) ?? null,
      slope_angle_deg: (input.slope_angle_deg as number | undefined) ?? null,
      results: input.results ?? null,
      notes: (input.notes as string | undefined) ?? null,
      created_at: nowIso(),
    }
    getDb().tests.push(t)
    persist(getDb())
    return delay(t)
  },

  getDebrief: (tripId) => {
    const d = getDb().debriefs.find((x) => x.trip_id === tripId)
    return d ? delay(d) : notFound('debrief')
  },
  upsertDebrief: (tripId, input) => {
    const list = getDb().debriefs
    let d = list.find((x) => x.trip_id === tripId)
    if (!d) {
      d = {
        id: uid(),
        trip_id: tripId,
        summary: null,
        decision_reflections: [],
        lessons_learned: null,
        submitted_at: null,
        created_at: nowIso(),
        updated_at: nowIso(),
      }
      list.push(d)
    }
    if (input.summary !== undefined) d.summary = input.summary
    if (input.lessons_learned !== undefined) d.lessons_learned = input.lessons_learned
    if (input.decision_reflections !== undefined) d.decision_reflections = input.decision_reflections
    d.updated_at = nowIso()
    persist(getDb())
    return delay(d)
  },
  submitDebrief: (tripId) => {
    const d = getDb().debriefs.find((x) => x.trip_id === tripId)
    if (!d) return notFound('debrief')
    d.submitted_at = nowIso()
    persist(getDb())
    return delay(d)
  },

  getWeather: (): Promise<WeatherSummary> =>
    Promise.reject(new Error('Weather lookups need the backend; the mock API does not fake NWS data.')),
}
