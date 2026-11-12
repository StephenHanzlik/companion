import type { ReactNode } from 'react'

type Props = {
  onGetStarted: () => void
  nav: ReactNode
}

const phases = [
  {
    name: 'Plan',
    body: 'Set objectives, route, forecast, hazards, and a go/no-go checklist before you leave.',
  },
  {
    name: 'Ride',
    body: 'Log timestamped field observations and snow profile tests while you are out.',
  },
  {
    name: 'Debrief',
    body: 'Summarize the trip, reflect on decision points, and capture lessons learned.',
  },
]

// Stage bands below the phase cards. Headlines only; the screenshots show the
// real pages. Trips is deliberately not previewed.
const stages = [
  {
    id: 'plan',
    eyebrow: '01 · Plan',
    headline: 'Prepare before you leave',
    points: [
      'Assemble your group',
      'Anticipate the hazard',
      'Manage avalanche terrain',
      'Plan your emergency',
    ],
    image: '/images/preview-plan.png',
    alt: 'The Plan your trip form, showing the avalanche problems table',
  },
  {
    id: 'ride',
    flip: true,
    eyebrow: '02 · Ride',
    headline: 'Record what you see in the field',
    points: [
      'Timestamped field observations',
      'Snow profile tests',
    ],
    image: '/images/preview-ride.png',
    alt: 'The Ride tab with observations and an add snow profile test form',
  },
  {
    id: 'debrief',
    eyebrow: '03 · Debrief',
    headline: 'Reflect and learn from the trip',
    points: [
      'Summarize the trip',
      'Reflect on decisions',
      'Capture lessons learned',
      'Submit when done',
    ],
    image: '/images/preview-debrief.png',
    alt: 'The Debrief tab with summary and lessons learned fields',
  },
]

export default function Landing({ onGetStarted, nav }: Props) {
  return (
    <section className="landing">
      <figure className="landing-hero">
        <img src="/images/hero-pine-trees.jpg" alt="Pine trees under a white and blue sky" />
        <div className="landing-hero-overlay">
          <h2>Plan the trip. Read the field. Learn from every tour.</h2>
          <p>
            A digital companion for backcountry ski touring, structured around a three-phase trip
            planning framework.
          </p>
          <button className="primary" onClick={onGetStarted}>
            Start a trip
          </button>
        </div>
        <div className="landing-nav">{nav}</div>
        <figcaption className="landing-credit">
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
        </figcaption>
      </figure>

      <div className="landing-phases">
        {phases.map((p, i) => (
          <div key={p.name} className="landing-phase-step">
            <article className="card landing-phase-card">
              <span className="landing-phase-number">{i + 1}</span>
              <h3>{p.name}</h3>
              <p>{p.body}</p>
            </article>
            {i < phases.length - 1 && (
              <span className="landing-arrow" aria-hidden="true">
                →
              </span>
            )}
          </div>
        ))}
      </div>

      {/* One horizontal band per phase. Plan first; Ride and Debrief to follow. */}
      {stages.map((s) => (
        <article key={s.id} className={s.flip ? 'landing-stage flip' : 'landing-stage'}>
          <div className="landing-stage-text">
            <p className="landing-stage-eyebrow">{s.eyebrow}</p>
            <h3>{s.headline}</h3>
            <ul>
              {s.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </div>
          <figure className="landing-stage-shot">
            <img src={s.image} alt={s.alt} loading="lazy" />
          </figure>
        </article>
      ))}
    </section>
  )
}
