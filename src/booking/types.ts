/**
 * Domeniu programări — pregătit pentru API / DB.
 *
 * Structură sugerată (colecții / tabele):
 *
 * services
 *   id, name, description, durationMinutes, priceLabel, category, active
 *
 * staff
 *   id, name, role, avatarUrl?, categoryIds[], active
 *
 * working_hours
 *   id, staffId | null (null = program salon),
 *   dayOfWeek (0=Duminică … 6=Sâmbătă),
 *   startTime ("08:00"), endTime ("22:00"), closed
 *
 * appointments
 *   id, serviceId, staffId, startsAt (ISO), endsAt (ISO),
 *   clientName, clientPhone, clientEmail?,
 *   status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
 *   createdAt, notes?
 *
 * În producție: GET /api/availability?serviceId&staffId&date
 *               POST /api/appointments
 */

export type BookingStep =
  | 'service'
  | 'staff'
  | 'datetime'
  | 'details'
  | 'success'

export type TimeSlot = {
  /** "09:00" */
  time: string
  /** ISO start */
  startsAt: string
  available: boolean
}

export type AppointmentDraft = {
  serviceId: string
  /** staff id sau "any" */
  staffId: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  startsAt: string
  clientName: string
  clientPhone: string
  clientEmail: string
}

export type Appointment = AppointmentDraft & {
  id: string
  endsAt: string
  status: 'confirmed' | 'pending' | 'cancelled'
  createdAt: string
}

export const ANY_STAFF_ID = 'any' as const
