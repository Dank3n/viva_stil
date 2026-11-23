import { getSupabase, isSupabaseConfigured } from '../lib/supabase'
import { normalizePhone } from '../account/phone'
import type { Appointment } from './types'

export { isSupabaseConfigured as isCloudBookingEnabled }

type SlotRow = {
  id: string
  staffId: string
  date: string
  time: string
  startsAt: string
  endsAt: string
  status: string
}

export async function cloudListSlots(): Promise<
  Pick<Appointment, 'id' | 'staffId' | 'date' | 'time' | 'startsAt' | 'endsAt' | 'status'>[]
> {
  const sb = getSupabase()
  if (!sb) return []
  const { data, error } = await sb.rpc('list_appointment_slots')
  if (error || !data) {
    console.warn('[Viva Stil] list_appointment_slots:', error?.message)
    return []
  }
  return (data as SlotRow[]).map((row) => ({
    id: row.id,
    staffId: row.staffId,
    date: row.date,
    time: row.time,
    startsAt: String(row.startsAt),
    endsAt: String(row.endsAt),
    status: row.status as Appointment['status'],
  }))
}

export async function cloudCreateAppointment(
  appointment: Appointment,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sb = getSupabase()
  if (!sb) return { ok: false, error: 'Supabase neconfigurat' }

  const { error } = await sb.from('appointments').insert({
    id: appointment.id,
    service_ids: appointment.serviceIds,
    staff_id: appointment.staffId,
    date: appointment.date,
    time: appointment.time,
    starts_at: appointment.startsAt,
    ends_at: appointment.endsAt,
    client_name: appointment.clientName,
    client_phone: normalizePhone(appointment.clientPhone),
    client_email: appointment.clientEmail.trim().toLowerCase(),
    status: appointment.status,
    created_at: appointment.createdAt,
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function cloudGetAppointmentsForPhone(
  phone: string,
): Promise<Appointment[]> {
  const sb = getSupabase()
  if (!sb) return []
  const { data, error } = await sb.rpc('get_appointments_for_phone', {
    p_phone: phone,
  })
  if (error || !data) {
    console.warn('[Viva Stil] get_appointments_for_phone:', error?.message)
    return []
  }
  return (data as Appointment[]).map((a) => ({
    ...a,
    serviceIds: a.serviceIds ?? [],
  }))
}
