import { ASPECT_NAMES } from '../api/planForm'

// Aspects on a 3×3 compass, laid out the way they sit on a map.
const GRID = ['NW', 'N', 'NE', 'W', '', 'E', 'SW', 'S', 'SE']

export function CompassPicker({
  selected,
  onToggle,
  label = 'Aspects',
}: {
  selected: string[]
  onToggle: (aspect: string) => void
  label?: string
}) {
  return (
    <div className="compass" role="group" aria-label={label}>
      {GRID.map((a, i) =>
        a ? (
          <button
            key={a}
            type="button"
            className="chip"
            aria-pressed={selected.includes(a)}
            aria-label={ASPECT_NAMES[a]}
            title={ASPECT_NAMES[a]}
            onClick={() => onToggle(a)}
          >
            {a}
          </button>
        ) : (
          <span key={i} className="compass-hub" aria-hidden="true" />
        ),
      )}
    </div>
  )
}
