/**
 * Program săptămânal al salonului.
 * dayOfWeek: 0 = Duminică … 6 = Sâmbătă (Date.getDay())
 *
 * DB: working_hours (staffId null = salon-wide)
 */

export type DayHours = {
  dayOfWeek: number
  start: string // HH:mm
  end: string
  closed?: boolean
}

/** Aliniat cu businessInfo.schedule. */
export const salonWorkingHours: DayHours[] = [
  { dayOfWeek: 0, start: '00:00', end: '00:00', closed: true }, // Duminică
  { dayOfWeek: 1, start: '08:00', end: '22:00' }, // Luni
  { dayOfWeek: 2, start: '08:00', end: '22:00' },
  { dayOfWeek: 3, start: '08:00', end: '22:00' },
  { dayOfWeek: 4, start: '08:00', end: '22:00' },
  { dayOfWeek: 5, start: '08:00', end: '22:00' }, // Vineri
  { dayOfWeek: 6, start: '08:00', end: '19:00' }, // Sâmbătă
]

export function getHoursForDate(date: Date): DayHours | null {
  const day = date.getDay()
  return salonWorkingHours.find((h) => h.dayOfWeek === day) ?? null
}
