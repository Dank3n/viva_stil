/** Parsează label-uri de tip "55 min", "1 h", "1 h 30 min" → minute. */
export function parseDurationMinutes(duration: string): number {
  const text = duration.toLowerCase().trim()
  const hours = text.match(/(\d+)\s*h/)
  const mins = text.match(/(\d+)\s*min/)
  const h = hours ? Number(hours[1]) : 0
  const m = mins ? Number(mins[1]) : 0
  if (h === 0 && m === 0) {
    const bare = text.match(/^(\d+)$/)
    if (bare) return Number(bare[1])
  }
  return h * 60 + m || 30
}
