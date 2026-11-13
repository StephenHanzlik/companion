import { ASPECTS, ASPECT_NAMES, ELEVATION_BANDS } from '../api/planForm'

// Aspect–elevation rose: eight aspects around, three elevation bands from the
// center out (above treeline in the middle, below treeline on the outside),
// the way avalanche forecasts draw them.

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

export function roseLabel(aspects: string[], elevations: string[]): string {
  if (aspects.length === 0 || elevations.length === 0) return 'No aspects or elevations selected'
  const a = ASPECTS.filter((x) => aspects.includes(x)).map((x) => ASPECT_NAMES[x]).join(', ')
  const e = ELEVATION_BANDS.filter((b) => elevations.includes(b.key)).map((b) => b.label.toLowerCase()).join(', ')
  return `${a}; ${e}`
}

export default function Rose({
  aspects,
  elevations,
  color,
  label,
  className,
}: {
  aspects: string[]
  elevations: string[]
  color: string
  label?: string
  className?: string
}) {
  const bands = ELEVATION_BANDS.map((b) => b.key)
  return (
    <svg className={`rose ${className ?? ''}`} viewBox="-92 -92 184 184" role="img" aria-label={label ?? roseLabel(aspects, elevations)}>
      {bands.map((band, b) =>
        ASPECTS.map((aspect, i) => {
          const on = aspects.includes(aspect) && elevations.includes(band)
          return (
            <path
              key={`${band}-${aspect}`}
              className="rose-cell"
              d={sector(RADII[b], RADII[b + 1], i * 45 - 22.5, i * 45 + 22.5)}
              fill={on ? color : BAND_TINTS[b]}
              stroke="#1c1f22"
              strokeWidth={0.7}
            />
          )
        }),
      )}
      {(['N', 'E', 'S', 'W'] as const).map((a) => {
        const [x, y] = point(83, ASPECTS.indexOf(a) * 45)
        return (
          <text key={a} x={x} y={y + 5} textAnchor="middle" className="rose-label">
            {a}
          </text>
        )
      })}
    </svg>
  )
}
