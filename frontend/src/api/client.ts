import type { Debrief, Observation, Plan, SnowProfileTest, Trip, WeatherSummary } from './types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

// Seeded by db/seed/seed.sql. Stands in for auth until the real thing exists.
export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${body}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  listTrips: () => request<Trip[]>('/api/trips'),
  createTrip: (input: { title: string; state: string; start_date?: string; end_date?: string }) =>
    request<Trip>('/api/trips', {
      method: 'POST',
      body: JSON.stringify({ owner_id: DEMO_USER_ID, ...input }),
    }),
  getTrip: (tripId: string) => request<Trip>(`/api/trips/${tripId}`),
  updateTripStatus: (tripId: string, status: string) =>
    request<Trip>(`/api/trips/${tripId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getPlan: (tripId: string) => request<Plan>(`/api/trips/${tripId}/plan`),
  upsertPlan: (tripId: string, input: Partial<Plan>) =>
    request<Plan>(`/api/trips/${tripId}/plan`, { method: 'PUT', body: JSON.stringify(input) }),
  signOffPlan: (tripId: string) =>
    request<Plan>(`/api/trips/${tripId}/plan/sign-off`, { method: 'POST' }),

  listObservations: (tripId: string) => request<Observation[]>(`/api/trips/${tripId}/observations`),
  createObservation: (tripId: string, input: Record<string, unknown>) =>
    request<Observation>(`/api/trips/${tripId}/observations`, {
      method: 'POST',
      body: JSON.stringify({ created_by: DEMO_USER_ID, ...input }),
    }),

  listSnowTests: (tripId: string) => request<SnowProfileTest[]>(`/api/trips/${tripId}/snow-tests`),
  createSnowTest: (tripId: string, input: Record<string, unknown>) =>
    request<SnowProfileTest>(`/api/trips/${tripId}/snow-tests`, {
      method: 'POST',
      body: JSON.stringify({ created_by: DEMO_USER_ID, ...input }),
    }),

  getDebrief: (tripId: string) => request<Debrief>(`/api/trips/${tripId}/debrief`),
  upsertDebrief: (tripId: string, input: Partial<Debrief>) =>
    request<Debrief>(`/api/trips/${tripId}/debrief`, { method: 'PUT', body: JSON.stringify(input) }),
  submitDebrief: (tripId: string) =>
    request<Debrief>(`/api/trips/${tripId}/debrief/submit`, { method: 'POST' }),

  getWeather: (lat: number, lon: number) =>
    request<WeatherSummary>(`/api/weather?lat=${lat}&lon=${lon}`),
}
