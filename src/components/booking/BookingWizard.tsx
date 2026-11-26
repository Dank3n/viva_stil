import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { sendBookingConfirmationEmail } from '../../account/notify'
import {
  getAvailableDates,
  getAvailableSlots,
  resolveStaffForSlot,
} from '../../booking/availability'
import { createAppointment, hydrateFromCloud } from '../../booking/store'
import {
  ANY_STAFF_ID,
  type Appointment,
  type BookingStep,
} from '../../booking/types'
import { services } from '../../data/services'
import {
  getSpecialistById,
  specialistsForServices,
} from '../../data/specialists'
import { ServiceStep } from './steps/ServiceStep'
import { StaffStep } from './steps/StaffStep'
import { DateTimeStep } from './steps/DateTimeStep'
import { DetailsStep } from './steps/DetailsStep'
import { SuccessStep } from './steps/SuccessStep'
import { BookingProgress } from './BookingProgress'

const STEPS: BookingStep[] = ['service', 'staff', 'datetime', 'details']

function stepIndex(step: BookingStep): number {
  if (step === 'success') return STEPS.length
  return STEPS.indexOf(step)
}

function parseInitialServices(params: URLSearchParams): string[] {
  const multi = params.getAll('service').filter((id) =>
    services.some((s) => s.id === id),
  )
  if (multi.length) return [...new Set(multi)]
  const single = params.get('service')
  if (single && services.some((s) => s.id === single)) return [single]
  return []
}

export function BookingWizard() {
  const [params, setParams] = useSearchParams()
  const initialServices = parseInitialServices(params)

  const [step, setStep] = useState<BookingStep>(
    initialServices.length ? 'staff' : 'service',
  )
  const [serviceIds, setServiceIds] = useState<string[]>(initialServices)
  const [staffId, setStaffId] = useState<string>(ANY_STAFF_ID)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [confirmed, setConfirmed] = useState<Appointment | null>(null)
  const [emailDelivery, setEmailDelivery] = useState<
    'sent' | 'local' | 'pending' | null
  >(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [availabilityTick, setAvailabilityTick] = useState(0)

  useEffect(() => {
    void hydrateFromCloud().then(() => setAvailabilityTick((n) => n + 1))
  }, [])

  useEffect(() => {
    const fromUrl = parseInitialServices(params)
    const same =
      fromUrl.length === serviceIds.length &&
      fromUrl.every((id) => serviceIds.includes(id))
    if (fromUrl.length && !same) {
      setServiceIds(fromUrl)
      setStaffId(ANY_STAFF_ID)
      setDate('')
      setTime('')
      setStartsAt('')
      setStep('staff')
    }
    // Sync only when URL changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const selectedServices = useMemo(
    () => services.filter((s) => serviceIds.includes(s.id)),
    [serviceIds],
  )

  const staffOptions = useMemo(
    () => (serviceIds.length ? specialistsForServices(serviceIds) : []),
    [serviceIds],
  )

  const availableDates = useMemo(() => {
    void availabilityTick
    if (!serviceIds.length || !staffId) return []
    return getAvailableDates(serviceIds, staffId)
  }, [serviceIds, staffId, availabilityTick])

  useEffect(() => {
    if (step !== 'datetime') return
    if (date && availableDates.includes(date)) return
    if (availableDates[0]) setDate(availableDates[0])
  }, [step, availableDates, date])

  const slots = useMemo(() => {
    void availabilityTick
    if (!serviceIds.length || !staffId || !date) return []
    return getAvailableSlots(serviceIds, staffId, date)
  }, [serviceIds, staffId, date, availabilityTick])

  function toggleService(id: string) {
    setServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function continueFromServices() {
    if (!serviceIds.length) return
    setStaffId(ANY_STAFF_ID)
    setDate('')
    setTime('')
    setStartsAt('')
    const next = new URLSearchParams()
    serviceIds.forEach((id) => next.append('service', id))
    setParams(next, { replace: true })
    setStep('staff')
  }

  function selectStaff(id: string) {
    setStaffId(id)
    setDate('')
    setTime('')
    setStartsAt('')
    setStep('datetime')
  }

  function selectSlot(nextDate: string, nextTime: string, nextStartsAt: string) {
    setDate(nextDate)
    setTime(nextTime)
    setStartsAt(nextStartsAt)
    setStep('details')
  }

  async function submitDetails(data: {
    clientName: string
    clientPhone: string
    clientEmail: string
  }) {
    if (!serviceIds.length || !staffId || !date || !time || !startsAt) return
    if (submitting) return
    setSubmitting(true)
    setEmailDelivery('pending')
    setEmailError(null)

    try {
      const resolvedStaff = resolveStaffForSlot(serviceIds, staffId, date, time)
      const staffName =
        getSpecialistById(resolvedStaff)?.name ??
        (staffId === ANY_STAFF_ID ? 'Oricare specialist' : staffLabel)

      const appointment = await createAppointment({
        serviceIds,
        staffId: resolvedStaff,
        date,
        time,
        startsAt,
        clientName: data.clientName.trim(),
        clientPhone: data.clientPhone.trim(),
        clientEmail: data.clientEmail.trim(),
      })

      const [y, m, d] = date.split('-').map(Number)
      const dateLabel = new Date(y, m - 1, d).toLocaleDateString('ro-RO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })

      const mail = await sendBookingConfirmationEmail({
        toEmail: appointment.clientEmail,
        clientName: appointment.clientName,
        services: selectedServices.map((s) => s.name).join(', '),
        date: dateLabel,
        time: appointment.time,
        staff: staffName,
      })

      setEmailDelivery(mail.ok ? 'sent' : 'local')
      setEmailError(
        mail.ok
          ? null
          : mail.reason || 'Emailul nu a putut fi trimis. Încearcă din nou.',
      )
      setConfirmed(appointment)
      setStep('success')
    } finally {
      setSubmitting(false)
    }
  }

  function restart() {
    setStep('service')
    setServiceIds([])
    setStaffId(ANY_STAFF_ID)
    setDate('')
    setTime('')
    setStartsAt('')
    setConfirmed(null)
    setEmailDelivery(null)
    setEmailError(null)
    setParams({}, { replace: true })
  }

  function goBack() {
    if (step === 'staff') setStep('service')
    else if (step === 'datetime') setStep('staff')
    else if (step === 'details') setStep('datetime')
  }

  const staffLabel =
    staffId === ANY_STAFF_ID
      ? 'Oricare specialist'
      : (getSpecialistById(staffId)?.name ?? '')

  return (
    <div className="border border-line bg-surface">
      {step !== 'success' ? (
        <div className="border-b border-line px-5 py-4 sm:px-8">
          <BookingProgress current={stepIndex(step)} total={STEPS.length} />
        </div>
      ) : null}

      <div className="p-5 sm:p-8 lg:p-10">
        {step === 'service' ? (
          <ServiceStep
            selectedIds={serviceIds}
            onToggle={toggleService}
            onContinue={continueFromServices}
          />
        ) : null}

        {step === 'staff' && selectedServices.length > 0 ? (
          <StaffStep
            services={selectedServices}
            options={staffOptions}
            selectedId={staffId}
            onSelect={selectStaff}
            onBack={goBack}
          />
        ) : null}

        {step === 'datetime' && selectedServices.length > 0 ? (
          <DateTimeStep
            services={selectedServices}
            staffLabel={staffLabel}
            availableDates={availableDates}
            slots={slots}
            selectedDate={date}
            selectedTime={time}
            onDateChange={(d) => {
              setDate(d)
              setTime('')
              setStartsAt('')
            }}
            onSelectSlot={selectSlot}
            onBack={goBack}
          />
        ) : null}

        {step === 'details' && selectedServices.length > 0 ? (
          <DetailsStep
            services={selectedServices}
            staffLabel={staffLabel}
            date={date}
            time={time}
            onBack={goBack}
            onSubmit={submitDetails}
            submitting={submitting}
          />
        ) : null}

        {step === 'success' && confirmed && selectedServices.length > 0 ? (
          <SuccessStep
            appointment={confirmed}
            services={selectedServices}
            staffName={
              getSpecialistById(confirmed.staffId)?.name ?? staffLabel
            }
            emailDelivery={emailDelivery === 'pending' ? null : emailDelivery}
            emailError={emailError}
            onRestart={restart}
          />
        ) : null}
      </div>
    </div>
  )
}
