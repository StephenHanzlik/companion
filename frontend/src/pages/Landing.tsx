import type { ReactNode } from 'react'
import Icon from '../components/Icon'
import { OvList, OvNote, OverviewCard, Progress } from '../components/Overview'
import Rose, { problemColor } from '../components/Rose'

type Props = {
  onStartTrip: () => void
}

const FLOW = [
  { where: 'At your desk', field: false, title: 'Plan the trip', body: 'Group, hazard, terrain and emergency plan, worked through in full.' },
  { where: 'Field book', field: true, title: 'Copy the essentials', body: 'Route, turnaround, problems and concerns go on paper before you leave.' },
  { where: 'On the tour', field: true, title: 'Note what you see', body: 'Observations, tests and plan changes, jotted by hand.' },
  { where: 'At your desk', field: false, title: 'Write up the day', body: 'Turn your notes into timestamped, located entries in Ride.' },
  { where: 'At your desk', field: false, title: 'Debrief', body: 'Reflect on decision points and capture what you’d change.' },
]

// Example content for the hero card and the Ride / Debrief panels. Marked as
// examples on the page; none of it is a real trip.
const EXAMPLE_PROBLEMS = [
  { name: 'Wind slab', aspects: ['N', 'NE', 'E'], elevations: ['ALP', 'NTL'] },
  { name: 'Persistent slab', aspects: ['NW', 'N', 'NE'], elevations: ['NTL'] },
]

function Phase({
  name,
  heading,
  lede,
  points,
  children,
}: {
  name: string
  heading: string
  lede: string
  points: string[]
  children: ReactNode
}) {
  return (
    <section className="lp-phase" aria-labelledby={`lp-${name}`}>
      <div className="lp-phase-text">
        <h2 id={`lp-${name}`}>
          <span className="lp-phase-tag">{name}</span> {heading}
        </h2>
        <p>{lede}</p>
        <ul className="lp-points">
          {points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
      {children}
    </section>
  )
}

export default function Landing({ onStartTrip }: Props) {
  return (
    <div className="landing">
      <section className="lp-hero">
        <img src="/images/hero-pine-trees.jpg" alt="Snow-covered peaks and pine trees under a blue sky" />
        <div className="lp-hero-in">
          <div className="lp-hero-copy">
            <h1>Do the thinking before the skin track.</h1>
            <p>
              Companion is the desk side of your field book. Work through Plan, Ride and Debrief in depth, carry the essentials uphill on
              paper, and come home to one connected record of the tour.
            </p>
            <div className="lp-ctas">
              <button className="btn btn-accent btn-lg" onClick={onStartTrip}>
                Start a trip
              </button>
              <a className="btn btn-ghost btn-lg" href="#how-it-works">
                How it works
              </a>
            </div>
          </div>
          <div className="lp-hero-card">
            <OverviewCard label="Example trip overview" title="Current Creek" meta={<><span className="mono">Sheet 014</span> · Berthoud Pass, CO · Example</>}>
              <Progress steps={['done', 'done', 'current', 'ahead', 'ahead']} label="Plan" value="16 of 24" />
              <div className="ov-rose-grid">
                {EXAMPLE_PROBLEMS.map((p, i) => (
                  <figure key={p.name} className="ov-rose">
                    <Rose aspects={p.aspects} elevations={p.elevations} color={problemColor(i)} />
                    <figcaption>
                      <i style={{ background: problemColor(i) }} aria-hidden="true" />
                      {p.name}
                    </figcaption>
                  </figure>
                ))}
              </div>
              <OvList
                rows={[
                  { label: 'Party', value: '4 members' },
                  { label: 'Turnaround', value: '13:00 · second bench' },
                ]}
              />
              <OvNote>From your plan entries. Not a hazard rating.</OvNote>
            </OverviewCard>
          </div>
        </div>
        <p className="lp-credit">
          Photo by{' '}
          <a
            href="https://unsplash.com/@rareair?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
            target="_blank"
            rel="noopener noreferrer"
          >
            Doug Duffee
          </a>{' '}
          on{' '}
          <a
            href="https://unsplash.com/photos/pine-trees-under-white-and-blue-sky-Glhx0spvqXI?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
            target="_blank"
            rel="noopener noreferrer"
          >
            Unsplash
          </a>
        </p>
      </section>

      <main className="lp-wrap" id="how-it-works">
        <div className="lp-intro">
          <h2>Your field book stays in your pack. The depth lives here.</h2>
          <p>
            The framework taught in avalanche education fits on a few pages of a field book. Companion gives each prompt room to be worked
            through properly, with your group, before and after the tour.
          </p>
        </div>

        <ol className="lp-flow">
          {FLOW.map((s, i) => (
            <li key={s.title} className={s.field ? 'is-field' : undefined}>
              <div className="lp-flow-top">
                <span className="mono">{i + 1}</span>
                <span className="lp-where">{s.where}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>

        <Phase
          name="Plan"
          heading="Prepare before you leave."
          lede="Every section of the plan is its own card, and the overview fills in as you go, so the whole trip is readable at a glance."
          points={['Assemble your group', 'Anticipate the hazard, by aspect and elevation', 'Plan to manage avalanche terrain', 'Discuss your emergency plan']}
        >
          <figure className="lp-shot">
            <img
              src="/images/plan-preview.png"
              alt="The Plan tab: the trip rail, the Anticipate the hazard section, and the trip overview with aspect roses"
              loading="lazy"
            />
            <figcaption>Plan tab · example trip</figcaption>
          </figure>
        </Phase>

        <Phase
          name="Ride"
          heading="Write up the day while it’s fresh."
          lede="Your hand notes become entries with a time, a place and a reason they matter."
          points={['Field observations and red flags', 'Snow profile tests', 'Plan changes and tactics used to reduce risk']}
        >
          <div className="lp-panel" aria-label="Example field record">
            <div className="lp-panel-head">
              <strong>Field record</strong>
              <span className="lp-panel-note">3 entries · example</span>
            </div>
            <ol className="entries">
              <li className="entry">
                <div className="entry-when">
                  <span className="mono">OBS-01</span>
                  <time>10:42</time>
                </div>
                <div className="entry-body">
                  <div className="badges">
                    <span className="badge badge-flag">Red flag</span>
                  </div>
                  <h3 className="entry-title">Shooting cracks on a wind-loaded rollover</h3>
                  <p className="entry-where">
                    <Icon name="pin" size={14} />
                    Below the ridge, NE side, about 11,400 ft
                  </p>
                  <p className="entry-why">
                    <span>Why it matters</span>
                    Matches the wind slab problem. We avoided similar slopes for the rest of the day.
                  </p>
                </div>
              </li>
              <li className="entry">
                <div className="entry-when">
                  <span className="mono">TEST-01</span>
                  <time>11:20</time>
                </div>
                <div className="entry-body">
                  <div className="badges">
                    <span className="badge">Extended column test</span>
                  </div>
                  <h3 className="entry-title">ECTP 14 down 40 cm</h3>
                  <dl className="facts">
                    <div>
                      <dt>Aspect</dt>
                      <dd>NE</dd>
                    </div>
                    <div>
                      <dt>Slope</dt>
                      <dd>32°</dd>
                    </div>
                    <div>
                      <dt>Elevation</dt>
                      <dd>11,250 ft</dd>
                    </div>
                  </dl>
                </div>
              </li>
              <li className="entry">
                <div className="entry-when">
                  <span className="mono">NOTE-01</span>
                  <time>12:05</time>
                </div>
                <div className="entry-body">
                  <div className="badges">
                    <span className="badge">Plan change</span>
                  </div>
                  <h3 className="entry-title">Turned around at the first bench</h3>
                  <p className="entry-text">Group consensus after the test result. Took the treed alternative down.</p>
                </div>
              </li>
            </ol>
          </div>
        </Phase>

        <Phase
          name="Debrief"
          heading="Close the loop."
          lede="Reflections link back to the observations behind them, so next season you can see why you decided what you did."
          points={['Summarize the trip', 'Reflect on each decision point', 'Capture lessons for next time']}
        >
          <div className="lp-panel" aria-label="Example debrief">
            <div className="lp-panel-head">
              <strong>Decision point · turnaround</strong>
              <span className="lp-panel-note">Example</span>
            </div>
            <div className="lp-reflect">
              <h3>Was turning at the first bench the right call?</h3>
              <p>
                Yes. Two independent signs pointed at the same layer, and the alternative kept us out of the terrain the advisory warned
                about.
              </p>
              <div className="link-list">
                <span className="link-pick" aria-pressed="true">
                  <span className="mono">OBS-01</span>
                  <span className="link-pick-title">Shooting cracks on a wind-loaded rollover</span>
                </span>
                <span className="link-pick" aria-pressed="true">
                  <span className="mono">TEST-01</span>
                  <span className="link-pick-title">ECTP 14 down 40 cm, NE, 32°</span>
                </span>
              </div>
            </div>
            <div className="lp-lesson">
              <span>Lesson learned</span>
              Agree on the turnaround trigger at the trailhead, not on the slope.
            </div>
          </div>
        </Phase>
      </main>

      <footer className="lp-close">
        <div className="lp-close-in">
          <div>
            <h2>Your next tour starts at the desk.</h2>
            <p>
              Companion structures and records your group’s thinking. It doesn’t rate hazard or make go/no-go calls, and it’s no substitute
              for avalanche education and experience.
            </p>
          </div>
          <button className="btn btn-accent btn-lg" onClick={onStartTrip}>
            Start a trip
          </button>
          <div className="lp-fine">
            <span>An independent project. Not affiliated with or endorsed by any avalanche education organization.</span>
            <span>Cold Mountain Software</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
