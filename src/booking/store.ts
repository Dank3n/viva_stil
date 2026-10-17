/**
 * Store mock pentru programări.
 * Înlocuiește cu fetch('/api/appointments') când ai backend.
 */

import { phonesMatch } from '../account/phone'
import type { Appointment, AppointmentDraft } from './types'
import { addMinutesToTime, totalDurationMinutes } from './duration'

const STORAGE_KEY = 'viva-stil-appointments-v2'

function load(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedAppointments()
    const parsed = JSON.parse(raw) as Appointment[]
    return parsed.map(normalizeAppointment)
  } catch {
    return seedAppointments()
  }
}

function normalizeAppointment(a: Appointment): Appointment {
  const serviceIds =
    a.serviceIds?.length ? a.serviceIds : a.serviceId ? [a.serviceId] : []
  return { ...a, serviceIds }
}

function save(items: Appointment[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* ignore quota */
  }
}

function ymdOffset(days: number): string {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Câteva programări mock — inclusiv istoric pentru contul demo. */
function seedAppointments(): Appointment[] {
  const date = ymdOffset(0)
  const date2 = ymdOffset(1)
  const past1 = ymdOffset(-12)
  const past2 = ymdOffset(-40)

  return [
    {
      id: 'apt-seed-1',
      serviceIds: ['coafat-perie-mediu'],
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
      serviceIds: ['manichiura-semipermanenta'],
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
    // Cont demo: 0723 111 222 / demo123
    {
      id: 'apt-demo-past-1',
      serviceIds: ['coafat-placa-lung', 'spalat-sweet'],
      staffId: 'cristina',
      date: past1,
      time: '16:30',
      startsAt: `${past1}T16:30:00`,
      endsAt: `${past1}T18:00:00`,
      clientName: 'Ana Popescu',
      clientPhone: '0723111222',
      clientEmail: 'ana@exemplu.ro',
      status: 'completed',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'apt-demo-past-2',
      serviceIds: ['manichiura-semipermanenta'],
      staffId: 'larisa-radu',
      date: past2,
      time: '11:00',
      startsAt: `${past2}T11:00:00`,
      endsAt: `${past2}T12:00:00`,
      clientName: 'Ana Popescu',
      clientPhone: '0723111222',
      clientEmail: 'ana@exemplu.ro',
      status: 'completed',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'apt-demo-upcoming',
      serviceIds: ['tratament-olaplex'],
      staffId: 'andrei',
      date: date2,
      time: '11:00',
      startsAt: `${date2}T11:00:00`,
      endsAt: `${date2}T11:30:00`,
      clientName: 'Ana Popescu',
      clientPhone: '0723111222',
      clientEmail: 'ana@exemplu.ro',
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
  const duration = totalDurationMinutes(draft.serviceIds)
  const endTime = addMinutesToTime(draft.time, duration)

  const appointment: Appointment = {
    ...draft,
    serviceIds: [...draft.serviceIds],
    id: `apt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    endsAt: `${draft.date}T${endTime}:00`,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }

  const all = listAppointments()
  all.push(appointment)
  memory = all
  save(all)
  return appointment
}

/** Programările unui client (după telefon). */
export function getAppointmentsForPhone(phone: string): Appointment[] {
  return listAppointments()
    .filter((a) => a.status !== 'cancelled' && phonesMatch(a.clientPhone, phone))
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
}

export function isAppointmentPast(a: Appointment): boolean {
  if (a.status === 'completed') return true
  const end = new Date(a.endsAt.replace(' ', 'T'))
  if (Number.isNaN(end.getTime())) {
    return new Date(`${a.date}T${a.time}:00`).getTime() < Date.now()
  }
  return end.getTime() < Date.now()
}
