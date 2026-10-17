import { useMemo, useState } from 'react'
import { useAuth } from '../../account/AuthContext'
import { getReviewForAppointment } from '../../account/reviewStore'
import {
  getAppointmentsForPhone,
  isAppointmentPast,
} from '../../booking/store'
import { getAppointmentServiceIds } from '../../booking/types'
import { getSpecialistById } from '../../data/specialists'
import { services } from '../../data/services'
import { Button } from '../ui/Button'
import { ReviewForm } from './ReviewForm'
import { StarRating } from './StarRating'

function formatDateRo(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('ro-RO', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function serviceNames(ids: string[]) {
  return ids
    .map((id) => services.find((s) => s.id === id)?.name ?? id)
    .join(' · ')
}

export function AppointmentHistory() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState<'upcoming' | 'past'>('past')
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const appointments = useMemo(() => {
    if (!user) return []
    void tick
    return getAppointmentsForPhone(user.phone)
  }, [user, tick])

  const upcoming = appointments.filter((a) => !isAppointmentPast(a))
  const past = appointments.filter((a) => isAppointmentPast(a))
  const list = tab === 'upcoming' ? upcoming : past

  if (!user) return null

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-taupe">
            Contul tău
          </p>
          <h2 className="mt-2 font-display text-3xl text-text sm:text-4xl">
            Bună, {user.name.split(' ')[0]}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {user.phone}
            {user.email ? ` · ${user.email}` : ''}
          </p>
        </div>
        <Button type="button" variant="secondary" size="md" onClick={logout}>
          Deconectare
        </Button>
      </div>

      <div className="mb-6 flex gap-2 border-b border-line">
        <button
          type="button"
          onClick={() => setTab('past')}
          className={[
            'px-4 pb-3 text-sm font-medium uppercase tracking-[0.12em] transition-colors',
            tab === 'past'
              ? 'border-b-2 border-champagne text-text'
              : 'text-muted hover:text-text',
          ].join(' ')}
        >
          Istoric ({past.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('upcoming')}
          className={[
            'px-4 pb-3 text-sm font-medium uppercase tracking-[0.12em] transition-colors',
            tab === 'upcoming'
              ? 'border-b-2 border-champagne text-text'
              : 'text-muted hover:text-text',
          ].join(' ')}
        >
          Viitoare ({upcoming.length})
        </button>
      </div>

      {list.length === 0 ? (
        <p className="border border-line bg-elevated/40 p-6 text-sm text-muted">
          {tab === 'past'
            ? 'Nu ai încă vizite în istoric. După o programare finalizată, apare aici.'
            : 'Nu ai programări viitoare. Poți rezerva oricând din pagină.'}
        </p>
      ) : (
        <ul className="space-y-4">
          {list.map((apt) => {
            const ids = getAppointmentServiceIds(apt)
            const staff = getSpecialistById(apt.staffId)
            const review = getReviewForAppointment(apt.id)
            const canReview = tab === 'past' && !review

            return (
              <li
                key={apt.id}
                className="border border-line bg-surface p-5 sm:p-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.16em] text-taupe">
                      {formatDateRo(apt.date)} · {apt.time}
                    </p>
                    <h3 className="mt-2 font-display text-xl text-text sm:text-2xl">
                      {serviceNames(ids)}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {staff?.name ?? 'Specialist'}
                      {staff?.role ? ` · ${staff.role}` : ''}
                    </p>
                  </div>
                  <span
                    className={[
                      'shrink-0 self-start text-[0.65rem] uppercase tracking-[0.14em]',
                      tab === 'past' ? 'text-champagne-soft' : 'text-muted',
                    ].join(' ')}
                  >
                    {tab === 'past' ? 'Finalizată' : 'Confirmată'}
                  </span>
                </div>

                {review ? (
                  <div className="mt-4 border-t border-line pt-4">
                    <StarRating value={review.rating} readOnly size={18} />
                    {review.title ? (
                      <p className="mt-2 font-medium text-text">{review.title}</p>
                    ) : null}
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {review.body}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
                      <span>Serviciu {review.aspects.service}/5</span>
                      <span>Specialist {review.aspects.specialist}/5</span>
                      <span>Atmosferă {review.aspects.atmosphere}/5</span>
                    </div>
                  </div>
                ) : null}

                {canReview && reviewingId !== apt.id ? (
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={() => setReviewingId(apt.id)}
                    >
                      Lasă o recenzie
                    </Button>
                  </div>
                ) : null}

                {reviewingId === apt.id ? (
                  <ReviewForm
                    appointmentId={apt.id}
                    userId={user.id}
                    clientName={user.name}
                    onCancel={() => setReviewingId(null)}
                    onSaved={() => {
                      setReviewingId(null)
                      setTick((n) => n + 1)
                    }}
                  />
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
