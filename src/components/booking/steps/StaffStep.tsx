import { ChevronLeft, Users } from 'lucide-react'
import { ANY_STAFF_ID } from '../../../booking/types'
import type { Service } from '../../../data/services'
import type { Specialist } from '../../../data/specialists'
import { Button } from '../../ui/Button'

type StaffStepProps = {
  services: Service[]
  options: Specialist[]
  selectedId: string
  onSelect: (id: string) => void
  onBack: () => void
}

export function StaffStep({
  services: selectedServices,
  options,
  selectedId,
  onSelect,
  onBack,
}: StaffStepProps) {
  const summary =
    selectedServices.length === 1
      ? selectedServices[0].name
      : `${selectedServices.length} servicii`

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-text"
      >
        <ChevronLeft size={16} strokeWidth={1.75} aria-hidden />
        Schimbă serviciile
      </button>

      <header className="mb-6">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-taupe">
          Pasul 2 · {summary}
        </p>
        <h2 className="mt-2 font-display text-2xl text-text sm:text-3xl">
          Alege specialistul
        </h2>
        <p className="mt-2 text-sm text-muted">
          Același specialist pentru toate serviciile selectate.
        </p>
      </header>

      {selectedServices.length > 1 ? (
        <ul className="mb-6 space-y-1 border border-line bg-elevated/40 p-4 text-sm text-muted">
          {selectedServices.map((s) => (
            <li key={s.id} className="flex justify-between gap-3">
              <span className="text-text">{s.name}</span>
              <span className="shrink-0">{s.duration}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <ul className="grid gap-3">
        <li>
          <button
            type="button"
            onClick={() => onSelect(ANY_STAFF_ID)}
            className={[
              'flex w-full items-center gap-4 border p-4 text-left transition-all sm:p-5',
              selectedId === ANY_STAFF_ID
                ? 'border-champagne bg-champagne/10'
                : 'border-line bg-elevated/40 hover:border-champagne/40',
            ].join(' ')}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-elevated text-champagne">
              <Users size={20} strokeWidth={1.5} aria-hidden />
            </span>
            <span>
              <span className="block font-display text-xl text-text">
                Oricare specialist disponibil
              </span>
              <span className="mt-0.5 block text-sm text-muted">
                Primul liber pentru intervalul ales
              </span>
            </span>
          </button>
        </li>

        {options.map((person) => (
          <li key={person.id}>
            <button
              type="button"
              onClick={() => onSelect(person.id)}
              className={[
                'flex w-full items-center gap-4 border p-4 text-left transition-all sm:p-5',
                selectedId === person.id
                  ? 'border-champagne bg-champagne/10'
                  : 'border-line bg-elevated/40 hover:border-champagne/40',
              ].join(' ')}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-elevated font-display text-lg text-champagne">
                {person.name
                  .split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl text-text">
                  {person.name}
                </span>
                <span className="mt-0.5 block text-sm text-muted">
                  {person.role}
                  {person.rating ? ` · ★ ${person.rating}` : ''}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {options.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          Nu există un specialist care să ofere toate serviciile selectate.
          Scoate unul din servicii sau alege din aceeași categorie.
        </p>
      ) : (
        <div className="mt-6 sm:hidden">
          <Button
            type="button"
            className="w-full"
            onClick={() => onSelect(selectedId || ANY_STAFF_ID)}
          >
            Continuă
          </Button>
        </div>
      )}
    </div>
  )
}
