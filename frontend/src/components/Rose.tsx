import type { KeyboardEvent } from 'react'
import { ASPECTS, ASPECT_NAMES, ELEVATION_BANDS, cellKey } from '../api/planForm'

// Aspect–elevation rose: eight aspects around, three elevation bands from the
// center out (above treeline in the middle, below treeline on the outside),
// the way avalanche forecasts draw them. Each cell is one aspect in one band.
// Pass onToggle to make it the picker: cells toggle on click, Enter or Space,
// and the aspect letters toggle a whole wedge.

// Fill per avalanche problem, in order. Keep in sync with --problem-* in CSS.
export const PROBLEM_COLORS = ['#d6f25c', '#5fb8e6', '#d9b37a', '#e59a9a']
export const problemColor = (i: number) => PROBLEM_COLORS[i % PROBLEM_COLORS.length]

// Ring tints from the center out: above, near, below treeline.
const BAND_TINTS = ['#ffffff', '#eceeee', '#d7dbdc']
const RADII = [0, 24, 48, 72]

function point(r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180
  return [r * Math.sin(a), -r * Math.cos(a)]
}

function sector(r0: number, r1: number, a0: number, a1: number): string {
  const [x0, y0] = point(r1, a0)
  const [x1, y1] = point(r1, a1)
  if (r0 === 0) return `M0 0 L${x0} ${y0} A${r1} ${r1} 0 0 1 ${x1} ${y1} Z`
  const [x2, y2] = point(r0, a1)
  const [x3, y3] = point(r0, a0)
  return `M${x0} ${y0} A${r1} ${r1} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${r0} ${r0} 0 0 0 ${x3} ${y3} Z`
}

const bandLabel = (band: string) => ELEVATION_BANDS.find((b) => b.key === band)?.label.toLowerCase() ?? band

// "Above treeline: N, NE. Near treeline: NE."
export function roseLabel(cells: string[]): string {
  if (cells.length === 0) return 'No aspects or elevations selected'
  return ELEVATION_BANDS.map((b) => {
    const aspects = ASPECTS.filter((a) => cells.includes(cellKey(a, b.key)))
    return aspects.length ? `${b.label}: ${aspects.join(', ')}.` : ''
  })
    .filter(Boolean)
    .join(' ')
}

const activate = (fn: () => void) => (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    fn()
  }
}

export default function Rose({
  cells,
  color,
  label,
  className,
  onToggle,
  onToggleAspect,
}: {
  cells: string[]
  color: string
  label?: string
  className?: string
  onToggle?: (cell: string) => void
  onToggleAspect?: (aspect: string) => void
}) {
  const editable = !!onToggle
  const bands = ELEVATION_BANDS.map((b) => b.key)
  const labelled = editable ? ASPECTS : (['N', 'E', 'S', 'W'] as const)

  return (
    <svg
      className={`rose${editable ? ' rose-edit' : ''} ${className ?? ''}`}
      viewBox="-92 -92 184 184"
      role={editable ? 'group' : 'img'}
      aria-label={label ?? roseLabel(cells)}
    >
      {bands.map((band, b) =>
        ASPECTS.map((aspect, i) => {
          const key = cellKey(aspect, band)
          const on = cells.includes(key)
          const d = sector(RADII[b], RADII[b + 1], i * 45 - 22.5, i * 45 + 22.5)
          return editable ? (
            <path
              key={key}
              className="rose-cell"
              d={d}
              fill={on ? color : BAND_TINTS[b]}
              stroke="#1c1f22"
              strokeWidth={0.7}
              role="checkbox"
              aria-checked={on}
              aria-label={`${ASPECT_NAMES[aspect]}, ${bandLabel(band)}`}
              tabIndex={0}
              onClick={() => onToggle(key)}
              onKeyDown={activate(() => onToggle(key))}
            >
              <title>{`${ASPECT_NAMES[aspect]}, ${bandLabel(band)}`}</title>
            </path>
          ) : (
            <path key={key} className="rose-cell" d={d} fill={on ? color : BAND_TINTS[b]} stroke="#1c1f22" strokeWidth={0.7} />
          )
        }),
      )}
      {labelled.map((a) => {
        const [x, y] = point(84, ASPECTS.indexOf(a) * 45)
        const text = (
          <text x={x} y={y + 5} textAnchor="middle" className="rose-label">
            {a}
          </text>
        )
        return onToggleAspect ? (
          <g
            key={a}
            className="rose-aspect"
            role="button"
            tabIndex={0}
            aria-label={`Toggle all of ${ASPECT_NAMES[a]}`}
            onClick={() => onToggleAspect(a)}
            onKeyDown={activate(() => onToggleAspect(a))}
          >
            <circle cx={x} cy={y} r={10} className="rose-aspect-hit" />
            {text}
          </g>
        ) : (
          <g key={a}>{text}</g>
        )
      })}
    </svg>
  )
}
