import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  getAvailableDates,
  getAvailableSlots,
  resolveStaffForSlot,
} from '../../booking/availability'
import { createAppointment } from '../../booking/store'
import {
  ANY_STAFF_ID,
  type Appointment,
  type BookingStep,
} from '../../booking/types'
import { services } from '../../data/services'
import {
  getSpecialistById,
  specialistsForService,
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

export function BookingWizard() {
  const [params, setParams] = useSearchParams()
  const initialService = params.get('service') ?? ''

  const [step, setStep] = useState<BookingStep>(
    initialService && services.some((s) => s.id === initialService)
      ? 'staff'
      : 'service',
  )
  const [serviceId, setServiceId] = useState(initialService)
  const [staffId, setStaffId] = useState<string>(ANY_STAFF_ID)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [confirmed, setConfirmed] = useState<Appointment | null>(null)

  useEffect(() => {
    const fromUrl = params.get('service') ?? ''
    if (fromUrl && services.some((s) => s.id === fromUrl) && fromUrl !== serviceId) {
      setServiceId(fromUrl)
      setStaffId(ANY_STAFF_ID)
      setDate('')
      setTime('')
      setStartsAt('')
      setStep('staff')
    }
    // Sync only when URL changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const service = useMemo(
    () => services.find((s) => s.id === serviceId),
    [serviceId],
  )
  const staffOptions = useMemo(
    () => (serviceId ? specialistsForService(serviceId) : []),
    [serviceId],
  )
  const availableDates = useMemo(() => {
    if (!serviceId || !staffId) return []
    return getAvailableDates(serviceId, staffId)
  }, [serviceId, staffId])

  useEffect(() => {
    if (step !== 'datetime') return
    if (date && availableDates.includes(date)) return
    if (availableDates[0]) setDate(availableDates[0])
  }, [step, availableDates, date])

  const slots = useMemo(() => {
    if (!serviceId || !staffId || !date) return []
    return getAvailableSlots(serviceId, staffId, date)
  }, [serviceId, staffId, date])

  function selectService(id: string) {
    setServiceId(id)
    setStaffId(ANY_STAFF_ID)
    setDate('')
    setTime('')
    setStartsAt('')
    setParams({ service: id }, { replace: true })
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

  function submitDetails(data: {
    clientName: string
    clientPhone: string
    clientEmail: string
  }) {
    if (!serviceId || !staffId || !date || !time || !startsAt) return

    const resolvedStaff = resolveStaffForSlot(serviceId, staffId, date, time)
    const appointment = createAppointment({
      serviceId,
      staffId: resolvedStaff,
      date,
      time,
      startsAt,
      clientName: data.clientName.trim(),
      clientPhone: data.clientPhone.trim(),
      clientEmail: data.clientEmail.trim(),
    })
    setConfirmed(appointment)
    setStep('success')
  }

  function restart() {
    setStep('service')
    setServiceId('')
    setStaffId(ANY_STAFF_ID)
    setDate('')
    setTime('')
    setStartsAt('')
    setConfirmed(null)
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
          <ServiceStep selectedId={serviceId} onSelect={selectService} />
        ) : null}

        {step === 'staff' && service ? (
          <StaffStep
            service={service}
            options={staffOptions}
            selectedId={staffId}
            onSelect={selectStaff}
            onBack={goBack}
          />
        ) : null}

        {step === 'datetime' && service ? (
          <DateTimeStep
            service={service}
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

        {step === 'details' && service ? (
          <DetailsStep
            service={service}
            staffLabel={staffLabel}
            date={date}
            time={time}
            onBack={goBack}
            onSubmit={submitDetails}
          />
        ) : null}

        {step === 'success' && confirmed && service ? (
          <SuccessStep
            appointment={confirmed}
            service={service}
            staffName={
              getSpecialistById(confirmed.staffId)?.name ?? staffLabel
            }
            onRestart={restart}
          />
        ) : null}
      </div>
    </div>
  )
}
