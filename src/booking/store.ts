/**
 * Store mock pentru programări.
 * Înlocuiește cu fetch('/api/appointments') când ai backend.
 */

import type { Appointment, AppointmentDraft } from './types'
import { parseDurationMinutes } from './duration'
import { services } from '../data/services'

const STORAGE_KEY = 'viva-stil-appointments'

function load(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedAppointments()
    return JSON.parse(raw) as Appointment[]
  } catch {
    return seedAppointments()
  }
}

function save(items: Appointment[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* ignore quota */
  }
}

/** Câteva programări mock pentru a demonstra sloturi ocupate. */
function seedAppointments(): Appointment[] {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  const date = `${y}-${m}-${d}`

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const y2 = tomorrow.getFullYear()
  const m2 = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const d2 = String(tomorrow.getDate()).padStart(2, '0')
  const date2 = `${y2}-${m2}-${d2}`

  return [
    {
      id: 'apt-seed-1',
      serviceId: 'coafat-perie-mediu',
      staffId: 'george',
      date,
      time: '10:00',
      startsAt: `${date}T10:00:00`,
      endsAt: `${date}T10:40:00`,
      clientName: 'Demo Client',
      clientPhone: '0700000000',
      clientEmail: '',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'apt-seed-2',
      serviceId: 'manichiura-semipermanenta',
      staffId: 'larisa-radu',
      date: date2,
      time: '14:00',
      startsAt: `${date2}T14:00:00`,
      endsAt: `${date2}T15:00:00`,
      clientName: 'Demo Client 2',
      clientPhone: '0700000001',
      clientEmail: '',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
  ]
}

let memory: Appointment[] | null = null

export function listAppointments(): Appointment[] {
  if (typeof window === 'undefined') return seedAppointments()
  if (!memory) memory = load()
  return memory
}

export function getAppointmentsForDay(
  date: string,
  staffId?: string,
): Appointment[] {
  return listAppointments().filter((a) => {
    if (a.status === 'cancelled') return false
    if (a.date !== date) return false
    if (staffId && staffId !== 'any' && a.staffId !== staffId) return false
    return true
  })
}

export function createAppointment(draft: AppointmentDraft): Appointment {
  const service = services.find((s) => s.id === draft.serviceId)
  const duration = parseDurationMinutes(service?.duration ?? '30 min')
  const start = new Date(draft.startsAt)
  const end = new Date(start.getTime() + duration * 60_000)

  const appointment: Appointment = {
    ...draft,
    id: `apt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    endsAt: end.toISOString(),
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }

  const all = listAppointments()
  all.push(appointment)
  memory = all
  save(all)
  return appointment
}
