import { useMemo, useState } from 'react'
import { Clock } from 'lucide-react'
import {
  serviceCategories,
  services,
  type Service,
} from '../../../data/services'

type ServiceStepProps = {
  selectedId: string
  onSelect: (id: string) => void
}

const categoriesWithItems = serviceCategories.filter((cat) =>
  services.some((s) => s.category === cat),
)

export function ServiceStep({ selectedId, onSelect }: ServiceStepProps) {
  const [category, setCategory] = useState<string>(categoriesWithItems[0] ?? '')

  const items = useMemo(
    () => services.filter((s) => s.category === category),
    [category],
  )

  return (
    <div>
      <header className="mb-6">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-taupe">
          Pasul 1
        </p>
        <h2 className="mt-2 font-display text-2xl text-text sm:text-3xl">
          Alege serviciul
        </h2>
        <p className="mt-2 text-sm text-muted">
          Selectează serviciul dorit pentru a continua.
        </p>
      </header>

      <div
        className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        role="tablist"
        aria-label="Categorii"
      >
        {categoriesWithItems.map((cat) => {
          const active = cat === category
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
            </button>
          )
        })}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((service) => (
          <li key={service.id}>
            <ServiceOption
              service={service}
              selected={service.id === selectedId}
              onSelect={() => onSelect(service.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

function ServiceOption({
  service,
  selected,
  onSelect,
}: {
  service: Service
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'flex h-full w-full flex-col border p-4 text-left transition-all duration-300 sm:p-5',
        selected
          ? 'border-champagne bg-champagne/10'
          : 'border-line bg-elevated/40 hover:border-champagne/40',
      ].join(' ')}
    >
      <span className="font-display text-xl text-text">{service.name}</span>
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
