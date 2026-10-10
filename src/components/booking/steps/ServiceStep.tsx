import { useMemo, useState } from 'react'
import { Check, Clock } from 'lucide-react'
import {
  formatDurationLabel,
  totalDurationMinutes,
} from '../../../booking/duration'
import {
  serviceCategories,
  services,
  type Service,
} from '../../../data/services'
import { Button } from '../../ui/Button'

type ServiceStepProps = {
  selectedIds: string[]
  onToggle: (id: string) => void
  onContinue: () => void
}

const categoriesWithItems = serviceCategories.filter((cat) =>
  services.some((s) => s.category === cat),
)

export function ServiceStep({
  selectedIds,
  onToggle,
  onContinue,
}: ServiceStepProps) {
  const [category, setCategory] = useState<string>(categoriesWithItems[0] ?? '')

  const items = useMemo(
    () => services.filter((s) => s.category === category),
    [category],
  )

  const selectedServices = useMemo(
    () => services.filter((s) => selectedIds.includes(s.id)),
    [selectedIds],
  )

  const totalMins = totalDurationMinutes(selectedIds)

  return (
    <div>
      <header className="mb-6">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-taupe">
          Pasul 1
        </p>
        <h2 className="mt-2 font-display text-2xl text-text sm:text-3xl">
          Alege serviciile
        </h2>
        <p className="mt-2 text-sm text-muted">
          Poți selecta mai multe — se fac la același specialist, durata se
          adună.
        </p>
      </header>

      <div
        className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        role="tablist"
        aria-label="Categorii"
      >
        {categoriesWithItems.map((cat) => {
          const active = cat === category
          const count = selectedServices.filter((s) => s.category === cat).length
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(cat)}
              className={[
                'shrink-0 rounded-full border px-3.5 py-2 text-[0.65rem] font-medium uppercase tracking-[0.12em] transition-colors',
                active
                  ? 'border-champagne bg-champagne text-bg'
                  : 'border-line text-muted hover:border-champagne/40 hover:text-text',
              ].join(' ')}
            >
              {cat}
              {count > 0 ? ` · ${count}` : ''}
            </button>
          )
        })}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((service) => (
          <li key={service.id}>
            <ServiceOption
              service={service}
              selected={selectedIds.includes(service.id)}
              onToggle={() => onToggle(service.id)}
            />
          </li>
        ))}
      </ul>

      <div className="sticky bottom-0 mt-8 border-t border-line bg-surface/95 pt-4 backdrop-blur-sm">
        {selectedIds.length > 0 ? (
          <div className="mb-3 space-y-1 text-sm text-muted">
            <p>
              <span className="text-text">{selectedIds.length}</span>{' '}
              {selectedIds.length === 1 ? 'serviciu' : 'servicii'} · durată
              totală{' '}
              <span className="text-champagne-soft">
                {formatDurationLabel(totalMins)}
              </span>
            </p>
            <p className="line-clamp-2 text-xs">
              {selectedServices.map((s) => s.name).join(' · ')}
            </p>
          </div>
        ) : (
          <p className="mb-3 text-sm text-muted">
            Selectează cel puțin un serviciu.
          </p>
        )}
        <Button
          type="button"
          className="w-full sm:w-auto"
          size="lg"
          disabled={selectedIds.length === 0}
          onClick={onContinue}
        >
          Continuă
        </Button>
      </div>
    </div>
  )
}

function ServiceOption({
  service,
  selected,
  onToggle,
}: {
  service: Service
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={[
        'relative flex h-full w-full flex-col border p-4 text-left transition-all duration-300 sm:p-5',
        selected
          ? 'border-champagne bg-champagne/10'
          : 'border-line bg-elevated/40 hover:border-champagne/40',
      ].join(' ')}
    >
      <span
        className={[
          'absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border transition-colors',
          selected
            ? 'border-champagne bg-champagne text-bg'
            : 'border-line text-transparent',
        ].join(' ')}
        aria-hidden
      >
        <Check size={14} strokeWidth={2.5} />
      </span>
      <span className="pr-8 font-display text-xl text-text">{service.name}</span>
      {service.description ? (
        <span className="mt-1.5 line-clamp-2 text-sm text-muted">
          {service.description}
        </span>
      ) : null}
      <span className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
        {service.duration ? (
          <span className="inline-flex items-center gap-1">
            <Clock size={13} strokeWidth={1.5} aria-hidden />
            {service.duration}
          </span>
        ) : null}
        {service.price ? (
          <span className="font-medium text-champagne-soft">{service.price}</span>
        ) : null}
      </span>
    </button>
  )
}
