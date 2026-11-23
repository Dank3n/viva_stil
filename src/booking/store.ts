/**
 * Programări: localStorage + sync Supabase (când e configurat).
 */

import { phonesMatch } from '../account/phone'
import {
  cloudCreateAppointment,
  cloudGetAppointmentsForPhone,
  cloudListSlots,
  isCloudBookingEnabled,
} from './cloudStore'
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

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function ymdOffset(days: number): string {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
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
      clientEmail: 'demo@exemplu.ro',
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
      clientEmail: 'demo2@exemplu.ro',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
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
let cloudHydrated = false

export function listAppointments(): Appointment[] {
  if (typeof window === 'undefined') return seedAppointments()
  if (!memory) memory = load()
  return memory
}

/** Încarcă sloturile din cloud (fără PII) pentru disponibilitate. */
export async function hydrateFromCloud(): Promise<void> {
  if (!isCloudBookingEnabled() || cloudHydrated) return
  try {
    const slots = await cloudListSlots()
    const all = listAppointments()
    const byId = new Map(all.map((a) => [a.id, a]))
    for (const slot of slots) {
      const existing = byId.get(slot.id)
      if (existing) {
        existing.staffId = slot.staffId
        existing.date = slot.date
        existing.time = slot.time
        existing.startsAt = slot.startsAt
        existing.endsAt = slot.endsAt
        existing.status = slot.status
      } else {
        const stub: Appointment = {
          id: slot.id,
          serviceIds: [],
          staffId: slot.staffId,
          date: slot.date,
          time: slot.time,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          clientName: '',
          clientPhone: '',
          clientEmail: '',
          status: slot.status,
          createdAt: new Date().toISOString(),
        }
        all.push(stub)
        byId.set(slot.id, stub)
      }
    }
    memory = all
    save(all)
    cloudHydrated = true
  } catch (err) {
    console.warn('[Viva Stil] hydrateFromCloud failed', err)
  }
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

export async function createAppointment(
  draft: AppointmentDraft,
): Promise<Appointment> {
  const duration = totalDurationMinutes(draft.serviceIds)
  const endTime = addMinutesToTime(draft.time, duration)

  const appointment: Appointment = {
    ...draft,
    serviceIds: [...draft.serviceIds],
    clientEmail: draft.clientEmail.trim().toLowerCase(),
    id: `apt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    endsAt: `${draft.date}T${endTime}:00`,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }

  const all = listAppointments()
  all.push(appointment)
  memory = all
  save(all)

  if (isCloudBookingEnabled()) {
    const cloud = await cloudCreateAppointment(appointment)
    if (!cloud.ok) {
      console.warn('[Viva Stil] Sync programare cloud:', cloud.error)
    }
  }

  return appointment
}

/** Programările unui client (după telefon) — cloud prioritar. */
export async function getAppointmentsForPhone(
  phone: string,
): Promise<Appointment[]> {
  if (isCloudBookingEnabled()) {
    const cloud = await cloudGetAppointmentsForPhone(phone)
    if (cloud.length) {
      return cloud.sort((a, b) => b.startsAt.localeCompare(a.startsAt))
    }
  }
  return listAppointments()
    .filter(
      (a) =>
        a.status !== 'cancelled' &&
        a.clientPhone &&
        phonesMatch(a.clientPhone, phone),
    )
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
