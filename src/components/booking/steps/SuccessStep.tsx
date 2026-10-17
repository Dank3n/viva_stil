import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { slotEndTime } from '../../../booking/availability'
import {
  formatDurationLabel,
  totalDurationMinutes,
} from '../../../booking/duration'
import {
  getAppointmentServiceIds,
  type Appointment,
} from '../../../booking/types'
import type { Service } from '../../../data/services'
import { businessInfo } from '../../../config/business'
import { Button } from '../../ui/Button'

type SuccessStepProps = {
  appointment: Appointment
  services: Service[]
  staffName: string
  onRestart: () => void
}

function formatDateRo(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function SuccessStep({
  appointment,
  services: selectedServices,
  staffName,
  onRestart,
}: SuccessStepProps) {
  const serviceIds = getAppointmentServiceIds(appointment)
  const endTime = slotEndTime(appointment.time, serviceIds)
  const totalMins = totalDurationMinutes(serviceIds)

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-champagne/20 text-champagne">
        <Check size={28} strokeWidth={1.75} aria-hidden />
      </div>

      <h2 className="mt-6 font-display text-3xl text-text sm:text-4xl">
        Programare confirmată
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
        Mulțumim, {appointment.clientName}. Te așteptăm la{' '}
        {businessInfo.name}.
      </p>

      <dl className="mt-8 space-y-3 border border-line bg-elevated/40 p-5 text-left text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted shrink-0">Servicii</dt>
          <dd className="text-right text-text">
            <ul className="space-y-1">
              {selectedServices.map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Specialist</dt>
          <dd className="text-right text-text">{staffName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Data</dt>
          <dd className="text-right capitalize text-text">
            {formatDateRo(appointment.date)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Interval</dt>
          <dd className="text-right text-text">
            {appointment.time} – {endTime}
            <span className="mt-0.5 block text-xs text-muted">
              {formatDurationLabel(totalMins)}
            </span>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Telefon</dt>
          <dd className="text-right text-text">{appointment.clientPhone}</dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button to="/cont" variant="primary" size="lg">
          Vezi programările tale
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onRestart}
        >
          Altă programare
        </Button>
      </div>

      <p className="mt-6 text-xs text-muted">
        Ai întrebări?{' '}
        <a
          href={`tel:${businessInfo.phone.replace(/\s/g, '')}`}
          className="text-champagne-soft underline-offset-2 hover:underline"
        >
          {businessInfo.phone}
        </a>
        {' · '}
        <Link
          to="/contact"
          className="text-champagne-soft underline-offset-2 hover:underline"
        >
          Contact
        </Link>
      </p>
    </div>
  )
}
