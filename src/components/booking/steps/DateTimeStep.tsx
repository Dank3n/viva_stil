import { ChevronLeft } from 'lucide-react'
import {
  formatDurationLabel,
  totalDurationMinutes,
} from '../../../booking/duration'
import { slotEndTime } from '../../../booking/availability'
import type { TimeSlot } from '../../../booking/types'
import type { Service } from '../../../data/services'
import { Button } from '../../ui/Button'

type DateTimeStepProps = {
  services: Service[]
  staffLabel: string
  availableDates: string[]
  slots: TimeSlot[]
  selectedDate: string
  selectedTime: string
  onDateChange: (date: string) => void
  onSelectSlot: (date: string, time: string, startsAt: string) => void
  onBack: () => void
}

const WEEKDAYS = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm']
const MONTHS = [
  'ian',
  'feb',
  'mar',
  'apr',
  'mai',
  'iun',
  'iul',
  'aug',
  'sep',
  'oct',
  'noi',
  'dec',
]

function formatDayChip(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return {
    weekday: WEEKDAYS[date.getDay()],
    day: d,
    month: MONTHS[date.getMonth()],
  }
}

export function DateTimeStep({
  services: selectedServices,
  staffLabel,
  availableDates,
  slots,
  selectedDate,
  selectedTime,
  onDateChange,
  onSelectSlot,
  onBack,
}: DateTimeStepProps) {
  const serviceIds = selectedServices.map((s) => s.id)
  const totalMins = totalDurationMinutes(serviceIds)
  const openSlots = slots.filter((s) => s.available)
  const endPreview = selectedTime
    ? slotEndTime(selectedTime, serviceIds)
    : null

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-text"
      >
        <ChevronLeft size={16} strokeWidth={1.75} aria-hidden />
        Schimbă specialistul
      </button>

      <header className="mb-6">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-taupe">
          Pasul 3 ·{' '}
          {selectedServices.length === 1
            ? selectedServices[0].name
            : `${selectedServices.length} servicii`}
        </p>
        <h2 className="mt-2 font-display text-2xl text-text sm:text-3xl">
          Alege data și ora
        </h2>
        <p className="mt-2 text-sm text-muted">
          {staffLabel} · durată totală {formatDurationLabel(totalMins)}
        </p>
      </header>

      {availableDates.length === 0 ? (
        <p className="text-sm text-muted">
          Nu există intervale libere de {formatDurationLabel(totalMins)} în
          următoarele zile. Încearcă alt specialist sau mai puține servicii.
        </p>
      ) : (
        <>
          <div
            className="mb-8 flex gap-2 overflow-x-auto pb-1 scrollbar-none"
            role="listbox"
            aria-label="Zile disponibile"
          >
            {availableDates.map((d) => {
              const chip = formatDayChip(d)
              const active = d === selectedDate
              return (
                <button
                  key={d}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => onDateChange(d)}
                  className={[
                    'flex w-[4.5rem] shrink-0 flex-col items-center border px-2 py-3 transition-colors',
                    active
                      ? 'border-champagne bg-champagne text-bg'
                      : 'border-line bg-elevated/40 text-text hover:border-champagne/40',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'text-[0.65rem] uppercase tracking-[0.14em]',
                      active ? 'text-bg/80' : 'text-muted',
                    ].join(' ')}
                  >
                    {chip.weekday}
                  </span>
                  <span className="mt-1 font-display text-2xl leading-none">
                    {chip.day}
                  </span>
                  <span
                    className={[
                      'mt-1 text-[0.65rem] uppercase',
                      active ? 'text-bg/80' : 'text-muted',
                    ].join(' ')}
                  >
                    {chip.month}
                  </span>
                </button>
              )
            })}
          </div>

          {selectedDate ? (
            <div>
              <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-taupe">
                Intervale libere (început)
              </p>
              {openSlots.length === 0 ? (
                <p className="text-sm text-muted">
                  Nu mai sunt ore libere de {formatDurationLabel(totalMins)} în
                  această zi.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {slots.map((slot) => {
                    const active =
                      slot.available && slot.time === selectedTime
                    const end = slotEndTime(slot.time, serviceIds)
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        title={
                          slot.available
                            ? `${slot.time} – ${end}`
                            : 'Indisponibil'
                        }
                        onClick={() =>
                          onSelectSlot(selectedDate, slot.time, slot.startsAt)
                        }
                        className={[
                          'border px-2 py-3 text-sm font-medium transition-colors',
                          !slot.available
                            ? 'cursor-not-allowed border-line/60 bg-transparent text-muted/40 line-through'
                            : active
                              ? 'border-champagne bg-champagne text-bg'
                              : 'border-line bg-elevated/40 text-text hover:border-champagne/50',
                        ].join(' ')}
                      >
                        <span className="block">{slot.time}</span>
                        {slot.available ? (
                          <span
                            className={[
                              'mt-0.5 block text-[0.65rem] font-normal',
                              active ? 'text-bg/75' : 'text-muted',
                            ].join(' ')}
                          >
                            – {end}
                          </span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              )}

              {selectedTime && endPreview ? (
                <div className="mt-6">
                  <p className="mb-3 text-sm text-muted">
                    Specialistul e rezervat{' '}
                    <span className="text-text">
                      {selectedTime} – {endPreview}
                    </span>{' '}
                    ({formatDurationLabel(totalMins)}).
                  </p>
                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      const slot = slots.find(
                        (s) => s.time === selectedTime && s.available,
                      )
                      if (slot)
                        onSelectSlot(selectedDate, slot.time, slot.startsAt)
                    }}
                  >
                    Continuă cu {selectedTime} – {endPreview}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted">
              Selectează o zi pentru a vedea orele.
            </p>
          )}
        </>
      )}
    </div>
  )
}
