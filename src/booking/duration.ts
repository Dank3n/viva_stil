import { services } from '../data/services'

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

/** Durata totală pentru unul sau mai multe servicii. */
export function totalDurationMinutes(serviceIds: string[]): number {
  if (!serviceIds.length) return 0
  return serviceIds.reduce((sum, id) => {
    const service = services.find((s) => s.id === id)
    return sum + parseDurationMinutes(service?.duration ?? '30 min')
  }, 0)
}

export function formatDurationLabel(minutes: number): string {
  if (minutes <= 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h && m) return `${h} h ${m} min`
  if (h) return `${h} h`
  return `${m} min`
}

/** Adaugă minute la "HH:mm" → "HH:mm". */
export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const hh = Math.floor(total / 60) % 24
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}
