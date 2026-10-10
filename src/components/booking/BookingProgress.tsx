const LABELS = ['Serviciu', 'Specialist', 'Dată & oră', 'Confirmare']

type BookingProgressProps = {
  current: number
  total: number
}

export function BookingProgress({ current, total }: BookingProgressProps) {
  return (
    <nav aria-label="Pași programare">
      <ol className="flex items-center gap-1 sm:gap-2">
        {LABELS.slice(0, total).map((label, i) => {
          const done = i < current
          const active = i === current
          return (
            <li
              key={label}
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
            >
              <div className="flex w-full items-center gap-1 sm:gap-2">
                {i > 0 ? (
                  <span
                    className={[
                      'h-px flex-1',
                      done || active ? 'bg-champagne/60' : 'bg-line',
                    ].join(' ')}
                    aria-hidden
                  />
                ) : null}
                <span
                  className={[
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-medium',
                    active
                      ? 'bg-champagne text-bg'
                      : done
                        ? 'bg-champagne/25 text-champagne-soft'
                        : 'bg-elevated text-muted',
                  ].join(' ')}
                  aria-current={active ? 'step' : undefined}
                >
                  {i + 1}
                </span>
                {i < total - 1 ? (
                  <span
                    className={[
                      'h-px flex-1',
                      done ? 'bg-champagne/60' : 'bg-line',
                    ].join(' ')}
                    aria-hidden
                  />
                ) : null}
              </div>
              <span
                className={[
                  'hidden truncate text-[0.65rem] uppercase tracking-[0.12em] sm:block',
                  active ? 'text-text' : 'text-muted',
                ].join(' ')}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
