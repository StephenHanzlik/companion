import { FormEvent, useEffect, useId, useMemo, useState } from 'react'
import { api } from '../api/client'
import type { Trip, TripStatus } from '../api/types'
import { US_STATES, stateName } from '../api/states'
import { formatDate, formatDateRange } from '../api/format'
import { isInProgress, phaseOf, sheetNumbers } from '../api/records'
import type { TripsRoute } from '../api/route'
import { Card, Field } from '../components/Form'
import Icon from '../components/Icon'
import { OverviewCard, OvList, OvNote } from '../components/Overview'
import StatusMark from '../components/StatusMark'
import TripRail from '../components/TripRail'
import TripWorkspace, { PhaseFrame } from './TripWorkspace'

function NewTripForm({ nextSheet, onCreated, onCancel }: { nextSheet: string; onCreated: (t: Trip) => void; onCancel: () => void }) {
  const id = useId()
  const [title, setTitle] = useState('')
  const [state, setState] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const datesValid = !startDate || !endDate || endDate >= startDate
  const ready = title.trim().length > 0 && state !== '' && datesValid && !saving

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!ready) return
    setSaving(true)
    setError(null)
    try {
      const t = await api.createTrip({
        title: title.trim(),
        state,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      onCreated(t)
    } catch (err) {
      setError(`Couldn’t create the trip: ${String(err)}`)
      setSaving(false)
    }
  }

  const header = (
    <header className="trip-head">
      <div className="trip-head-text">
        <button className="back-link" onClick={onCancel}>
          <Icon name="arrow-left" size={14} />
          All trips
        </button>
        <h1>New trip</h1>
        <p className="trip-meta">
          <span className="mono">Sheet {nextSheet}</span>
        </p>
      </div>
    </header>
  )

  const aside = (
    <OverviewCard label="What happens next" title="What happens next" meta={<span className="mono">Sheet {nextSheet}</span>}>
      <ol className="ov-steps">
        <li>
          <strong>Plan</strong>
          <span>Work through your group, the hazard, terrain, and emergency plan at your desk.</span>
        </li>
        <li>
          <strong>Ride</strong>
          <span>Take the essentials in your field book. Write up the day when you get home.</span>
        </li>
        <li>
          <strong>Debrief</strong>
          <span>Reflect on the decision points and capture what you’d change.</span>
        </li>
      </ol>
    </OverviewCard>
  )

  return (
    <PhaseFrame header={header} aside={aside}>
      <Card title="Trip details" className="card-form">
        <form onSubmit={handleCreate} className="card-body">
          <Field label="Name" help="— area and objective" htmlFor={`${id}-title`}>
            <input
              id={`${id}-title`}
              className="input"
              placeholder="e.g. Berthoud Pass — Current Creek"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </Field>
          <Field label="State" htmlFor={`${id}-state`}>
            <select id={`${id}-state`} className="input" value={state} onChange={(e) => setState(e.target.value)} required>
              <option value="">Choose a state</option>
              {US_STATES.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid-2">
            <Field label="Start date" htmlFor={`${id}-start`}>
              <input id={`${id}-start`} className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field label="End date" htmlFor={`${id}-end`}>
              <input
                id={`${id}-end`}
                className="input"
                type="date"
                value={endDate}
                min={startDate || undefined}
                aria-invalid={!datesValid}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Field>
          </div>
          {!datesValid && <p className="callout callout-error">The end date is before the start date.</p>}
          {error && <p className="callout callout-error">{error}</p>}
          <div className="form-foot">
            <span className="help">You can change the plan any time before you sign it off.</span>
            <div className="btn-row">
              <button type="button" className="btn btn-quiet" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-accent" disabled={!ready}>
                {saving ? 'Creating…' : 'Create trip'}
              </button>
            </div>
          </div>
        </form>
      </Card>
    </PhaseFrame>
  )
}

function TripsHome({
  trips,
  sheets,
  loading,
  error,
  onOpen,
  onNew,
  onRetry,
}: {
  trips: Trip[]
  sheets: Map<string, string>
  loading: boolean
  error: string | null
  onOpen: (id: string) => void
  onNew: () => void
  onRetry: () => void
}) {
  const planning = trips.filter((t) => t.status === 'planning')
  const riding = trips.filter((t) => t.status === 'active')
  const done = trips.filter((t) => t.status === 'debriefed')
  const today = new Date().toISOString().slice(0, 10)
  const next = [...planning].filter((t) => t.start_date && t.start_date >= today).sort((a, b) => a.start_date!.localeCompare(b.start_date!))[0]

  const header = (
    <header className="trip-head">
      <div className="trip-head-text">
        <h1>Trips</h1>
        <p className="trip-meta">
          {loading ? 'Loading…' : `${trips.length} ${trips.length === 1 ? 'trip' : 'trips'} · ${trips.filter(isInProgress).length} in progress`}
        </p>
      </div>
      <button className="btn btn-accent" onClick={onNew}>
        <Icon name="plus" size={14} />
        New trip
      </button>
    </header>
  )

  const aside = (
    <OverviewCard label="Trips overview" title="Your trips" meta="All seasons">
      <OvList
        rows={[
          { label: 'Planning', value: loading ? '—' : planning.length, empty: loading || planning.length === 0 },
          { label: 'In Ride, not yet debriefed', value: loading ? '—' : riding.length, empty: loading || riding.length === 0 },
          { label: 'Debriefed', value: loading ? '—' : done.length, empty: loading || done.length === 0 },
          {
            label: 'Next trip',
            value: loading ? '—' : next ? `${formatDate(next.start_date)} · ${sheets.get(next.id)}` : 'None scheduled',
            empty: loading || !next,
          },
        ]}
      />
      {riding.length > 0 && (
        <>
          <h3 className="ov-subhead">Waiting for a debrief</h3>
          <ul className="ov-decisions">
            {riding.map((t) => (
              <li key={t.id}>
                <button className="ov-link" onClick={() => onOpen(t.id)}>
                  {t.title}
                </button>
                <span className="mono">{sheets.get(t.id)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <OvNote>A trip moves to Ride when its plan is signed off, and to Debriefed when the debrief is submitted.</OvNote>
    </OverviewCard>
  )

  return (
    <PhaseFrame header={header} aside={aside}>
      {error ? (
        <div className="card card-pad">
          <p className="callout callout-error">Couldn’t load trips. {error}</p>
          <button className="btn btn-quiet" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : loading ? (
        <div className="skeleton-list" aria-label="Loading trips">
          <span />
          <span />
          <span />
        </div>
      ) : trips.length === 0 ? (
        <div className="card empty empty-lg">
          <p className="empty-title">Plan your first trip</p>
          <p>
            Each trip moves through Plan, Ride, and Debrief. Start with the plan at your desk: who’s going, the hazard, your terrain
            choices, and an emergency plan.
          </p>
          <button className="btn btn-accent" onClick={onNew}>
            <Icon name="plus" size={14} />
            New trip
          </button>
        </div>
      ) : (
        <Card title="All trips" aside={<span className="count">{trips.length}</span>}>
          <div className="table-wrap">
            <table className="table table-trips">
              <thead>
                <tr>
                  <th scope="col">Sheet</th>
                  <th scope="col">Trip</th>
                  <th scope="col">State</th>
                  <th scope="col">Dates</th>
                  <th scope="col">Phase</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t.id} onClick={() => onOpen(t.id)}>
                    <td className="mono cell-muted">{sheets.get(t.id)}</td>
                    <td>
                      <button className="row-link" onClick={(e) => (e.stopPropagation(), onOpen(t.id))}>
                        {t.title}
                      </button>
                    </td>
                    <td>{stateName(t.state) ?? '—'}</td>
                    <td className="cell-nowrap">{formatDateRange(t.start_date, t.end_date)}</td>
                    <td>
                      <StatusMark status={t.status} withLabel />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </PhaseFrame>
  )
}

export default function TripsPage({
  route,
  onNavigate,
}: {
  route: TripsRoute
  onNavigate: (r: TripsRoute, opts?: { replace?: boolean }) => void
}) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    setError(null)
    return api
      .listTrips()
      .then((t) => setTrips(t ?? []))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const sheets = useMemo(() => sheetNumbers(trips), [trips])
  const nextSheet = String(trips.length + 1).padStart(3, '0')
  const selected = route.kind === 'trip' ? trips.find((t) => t.id === route.id) ?? null : null

  // A trip opened without a tab lands on the phase it is in.
  useEffect(() => {
    if (route.kind === 'trip' && !route.tab && selected) {
      onNavigate({ kind: 'trip', id: selected.id, tab: phaseOf(selected.status) }, { replace: true })
    }
  }, [route, selected, onNavigate])

  async function changeStatus(tripId: string, status: TripStatus) {
    const updated = await api.updateTripStatus(tripId, status)
    setTrips((ts) => ts.map((t) => (t.id === tripId ? updated : t)))
  }

  const open = (id: string) => {
    const t = trips.find((x) => x.id === id)
    onNavigate({ kind: 'trip', id, tab: t ? phaseOf(t.status) : undefined })
  }
  const home = () => onNavigate({ kind: 'home' })
  const missing = route.kind === 'trip' && !loading && !selected

  return (
    <div className={`trips-page${route.kind === 'home' ? '' : ' has-focus'}`}>
      <TripRail
        trips={trips}
        sheets={sheets}
        selectedId={selected?.id ?? null}
        loading={loading}
        onSelect={open}
        onHome={home}
        onNew={() => onNavigate({ kind: 'new' })}
      />
      <div className="trips-content">
        {route.kind === 'new' && (
          <NewTripForm
            nextSheet={nextSheet}
            onCancel={home}
            onCreated={(t) => {
              setTrips((ts) => [t, ...ts])
              onNavigate({ kind: 'trip', id: t.id, tab: 'plan' })
            }}
          />
        )}
        {route.kind === 'trip' && selected && (
          <TripWorkspace
            trip={selected}
            sheet={sheets.get(selected.id) ?? '—'}
            tab={route.tab ?? phaseOf(selected.status)}
            onTab={(tab) => onNavigate({ kind: 'trip', id: selected.id, tab })}
            onStatusChange={(s) => changeStatus(selected.id, s)}
            onBack={home}
          />
        )}
        {(route.kind === 'home' || missing || (route.kind === 'trip' && loading)) && (
          <TripsHome
            trips={trips}
            sheets={sheets}
            loading={loading}
            error={error ?? (missing ? 'That trip wasn’t found. It may have been removed.' : null)}
            onOpen={open}
            onNew={() => onNavigate({ kind: 'new' })}
            onRetry={() => (missing ? home() : load())}
          />
        )}
      </div>
    </div>
  )
}
