import { Star } from 'lucide-react'

type StarRatingProps = {
  value: number
  onChange?: (value: number) => void
  size?: number
  label?: string
  readOnly?: boolean
}

export function StarRating({
  value,
  onChange,
  size = 22,
  label,
  readOnly = false,
}: StarRatingProps) {
  const interactive = Boolean(onChange) && !readOnly

  return (
    <div className="inline-flex flex-col gap-1">
      {label ? (
        <span className="text-[0.65rem] uppercase tracking-[0.16em] text-taupe">
          {label}
        </span>
      ) : null}
      <div
        className="flex items-center gap-0.5"
        role={interactive ? 'radiogroup' : 'img'}
        aria-label={label ?? `Rating ${value} din 5`}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= value
          if (!interactive) {
            return (
              <Star
                key={star}
                size={size}
                strokeWidth={1.5}
                className={active ? 'fill-champagne text-champagne' : 'text-line'}
                aria-hidden
              />
            )
          }
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={star === value}
              aria-label={`${star} ${star === 1 ? 'stea' : 'stele'}`}
              onClick={() => onChange?.(star)}
              className="rounded-sm p-0.5 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
            >
              <Star
                size={size}
                strokeWidth={1.5}
                className={
                  active ? 'fill-champagne text-champagne' : 'text-muted/50'
                }
                aria-hidden
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
