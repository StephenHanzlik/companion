// Static field reminder: the four-step loop, repeated at each juncture.
// Inline SVG and CSS only, so it renders offline.

function Icon({ name }: { name: 'snow' | 'chat' | 'mountain' | 'risk' }) {
  const common = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  if (name === 'snow') {
    return (
      <svg {...common}>
        <path d="M12 2v20M3.3 7l17.4 10M3.3 17l17.4-10" />
        <path d="M9 4l3 2 3-2M9 20l3-2 3 2" />
      </svg>
    )
  }
  if (name === 'chat') {
    return (
      <svg {...common}>
        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.2A8 8 0 1 1 21 12z" />
      </svg>
    )
  }
  if (name === 'mountain') {
    return (
      <svg {...common}>
        <path d="M2 20l7-12 4 6 3-4 6 10z" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M4 12h12M12 6l6 6-6 6" />
      <path d="M4 4v16" />
    </svg>
  )
}

const DOWN_ARROW = (
  <svg className="sa-down" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M10 2v14M5 11l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const STEPS = [
  { icon: 'snow', title: 'Monitor conditions along your route', body: 'Alert your group to unstable conditions.' },
  { icon: 'chat', title: 'Check in with your group', body: 'Reassess your plan.' },
  { icon: 'mountain', title: 'Recognize avalanche terrain', body: 'Assess consequences.' },
  { icon: 'risk', title: 'Use terrain to reduce your risk', body: 'Manage the group.' },
] as const

export default function StayAwareLoop() {
  return (
    <section className="stay-aware" aria-labelledby="stay-aware-title">
      <h3 id="stay-aware-title" className="sa-heading">Stay aware</h3>
      <div className="sa-loop">
        <div className="sa-bar" aria-hidden="true">
          <span>Repeat at each juncture · Stay aware</span>
        </div>
        <div className="sa-return" aria-hidden="true">
          <svg viewBox="0 0 40 100" preserveAspectRatio="none">
            <path d="M34 96 H10 V6 H30" fill="none" stroke="currentColor" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          </svg>
          <svg className="sa-return-head" width="14" height="14" viewBox="0 0 14 14">
            <path d="M0 0 L14 7 L0 14 Z" fill="currentColor" />
          </svg>
        </div>
        <ol className="sa-steps">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <div className="sa-card">
                <span className="sa-icon">
                  <Icon name={s.icon} />
                </span>
                <div>
                  <p className="sa-title">{s.title}</p>
                  <p className="sa-body">{s.body}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && DOWN_ARROW}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
