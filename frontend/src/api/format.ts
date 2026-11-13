// Dates arrive as YYYY-MM-DD. Parse as local time so they don't shift a day.
export function formatDate(d: string | null): string {
  if (!d) return '—'
  const [y, m, day] = d.split('-').map(Number)
  return new Date(y, m - 1, day).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

// Shows a date range, or whichever end is known.
export function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return 'No dates set'
  if (start && end && start === end) return formatDate(start)
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`
  return formatDate(start ?? end)
}
