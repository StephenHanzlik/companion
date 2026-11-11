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
    </section>
  )
}
