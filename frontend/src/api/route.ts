import type { Phase } from './records'

// Hash routes, so a refresh or a shared link lands on the same screen:
//   #/                      landing
//   #/trips                 all trips
//   #/trips/new             new trip
//   #/trips/<id>[/<phase>]  a trip, optionally on a phase tab
//   #/weather               Weather POC

export type TripsRoute = { kind: 'home' } | { kind: 'new' } | { kind: 'trip'; id: string; tab?: Phase }

export type Route = { view: 'home' } | { view: 'weather' } | { view: 'trips'; sub: TripsRoute }

const PHASE_IDS: Phase[] = ['plan', 'ride', 'debrief']

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent)
  if (parts[0] === 'weather') return { view: 'weather' }
  if (parts[0] !== 'trips') return { view: 'home' }
  if (!parts[1]) return { view: 'trips', sub: { kind: 'home' } }
  if (parts[1] === 'new') return { view: 'trips', sub: { kind: 'new' } }
  const tab = PHASE_IDS.find((p) => p === parts[2])
  return { view: 'trips', sub: { kind: 'trip', id: parts[1], tab } }
}

export function formatRoute(r: Route): string {
  if (r.view === 'home') return '#/'
  if (r.view === 'weather') return '#/weather'
  const s = r.sub
  if (s.kind === 'home') return '#/trips'
  if (s.kind === 'new') return '#/trips/new'
  return `#/trips/${encodeURIComponent(s.id)}${s.tab ? `/${s.tab}` : ''}`
}

export function navigate(r: Route, opts: { replace?: boolean } = {}) {
  const hash = formatRoute(r)
  if (window.location.hash === hash) return
  if (opts.replace) {
    window.history.replaceState(null, '', hash)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    window.location.hash = hash
  }
}
