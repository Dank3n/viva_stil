/**
 * Generare sloturi disponibile.
 * În producție: GET /api/availability?serviceId=&staffId=&date=
 */

import { parseDurationMinutes } from './duration'
import { getHoursForDate } from './workingHours'
import { getAppointmentsForDay } from './store'
import { ANY_STAFF_ID, type TimeSlot } from './types'
import { services } from '../data/services'
import { specialistsForService } from '../data/specialists'

const SLOT_STEP_MINUTES = 30

function parseHm(hm: string): number {
  const [h, m] = hm.split(':').map(Number)
  return h * 60 + m
}

function formatHm(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function overlaps(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd
}

function isPastSlot(dateStr: string, time: string): boolean {
  const now = new Date()
  const [y, mo, d] = dateStr.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const slot = new Date(y, mo - 1, d, hh, mm, 0, 0)
  return slot.getTime() <= now.getTime()
}

function staffBusyRanges(
  date: string,
  staffId: string,
): Array<{ start: number; end: number }> {
  return getAppointmentsForDay(date, staffId).map((a) => {
    const start = parseHm(a.time)
    const svc = services.find((s) => s.id === a.serviceId)
    const dur = parseDurationMinutes(svc?.duration ?? '30 min')
    return { start, end: start + dur }
  })
}

function slotsForStaff(
  date: string,
  staffId: string,
  durationMin: number,
  dayStart: number,
  dayEnd: number,
): TimeSlot[] {
  const busy = staffBusyRanges(date, staffId)
  const slots: TimeSlot[] = []

  for (let t = dayStart; t + durationMin <= dayEnd; t += SLOT_STEP_MINUTES) {
    const time = formatHm(t)
    const end = t + durationMin
    const conflict = busy.some((b) => overlaps(t, end, b.start, b.end))
    const past = isPastSlot(date, time)
    slots.push({
      time,
      startsAt: `${date}T${time}:00`,
      available: !conflict && !past,
    })
  }
  return slots
}

export function getAvailableSlots(
  serviceId: string,
  staffId: string,
  date: string,
): TimeSlot[] {
  const service = services.find((s) => s.id === serviceId)
  if (!service) return []

  const [y, mo, d] = date.split('-').map(Number)
  const dateObj = new Date(y, mo - 1, d)
  const hours = getHoursForDate(dateObj)
  if (!hours || hours.closed) return []

  const dayStart = parseHm(hours.start)
  const dayEnd = parseHm(hours.end)
  const durationMin = parseDurationMinutes(service.duration)

  if (staffId === ANY_STAFF_ID) {
    const team = specialistsForService(serviceId)
    if (team.length === 0) return []

    const byTime = new Map<string, TimeSlot>()
    for (const member of team) {
      for (const slot of slotsForStaff(
        date,
        member.id,
        durationMin,
        dayStart,
        dayEnd,
      )) {
        const prev = byTime.get(slot.time)
        if (!prev) {
          byTime.set(slot.time, { ...slot })
        } else if (slot.available) {
          prev.available = true
        }
      }
    }
    return Array.from(byTime.values()).sort((a, b) =>
      a.time.localeCompare(b.time),
    )
  }

  return slotsForStaff(date, staffId, durationMin, dayStart, dayEnd)
}

/** Zile disponibile în următoarele N zile (are măcar un slot liber). */
export function getAvailableDates(
  serviceId: string,
  staffId: string,
  daysAhead = 21,
): string[] {
  const out: string[] = []
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${day}`
    const slots = getAvailableSlots(serviceId, staffId, dateStr)
    if (slots.some((s) => s.available)) out.push(dateStr)
  }
  return out
}

/** Alocă un specialist liber pentru slot când user a ales „Oricare”. */
export function resolveStaffForSlot(
  serviceId: string,
  staffId: string,
  date: string,
  time: string,
): string {
  if (staffId !== ANY_STAFF_ID) return staffId
  const team = specialistsForService(serviceId)
  for (const member of team) {
    const slots = getAvailableSlots(serviceId, member.id, date)
    if (slots.some((s) => s.time === time && s.available)) return member.id
  }
  return team[0]?.id ?? staffId
}
