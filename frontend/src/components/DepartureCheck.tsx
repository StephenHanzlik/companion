// Static reminder. Nothing here is saved.
export default function DepartureCheck() {
  return (
    <section className="card departure-check" aria-labelledby="departure-check-title">
      <h3 id="departure-check-title">Conduct a departure check</h3>
      <p className="muted">Confirm gear, time plan, and communication plan. Conduct a function check (beacon check).</p>
      <ul>
        <li>Gear</li>
        <li>Time plan</li>
        <li>Communication plan</li>
        <li>Function check (beacon check)</li>
      </ul>
    </section>
  )
}
