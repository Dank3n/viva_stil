import { Button } from './Button'

type BookCtaProps = {
  label?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'inverse'
  size?: 'md' | 'lg'
  className?: string
  /** ID local al serviciului — preselectează pe /programari */
  serviceId?: string
  /** Butonul sticky — nu ascunde sticky-ul când e vizibil. */
  stickySelf?: boolean
}

export function BookCta({
  label = 'Programează-te',
  variant = 'primary',
  size = 'md',
  className,
  serviceId,
  stickySelf = false,
}: BookCtaProps) {
  const bookingPath = serviceId
    ? `/programari?service=${encodeURIComponent(serviceId)}`
    : '/programari'

  return (
    <Button
      to={bookingPath}
      variant={variant}
      size={size}
      className={className}
      {...(stickySelf
        ? { 'data-sticky-cta': '' }
        : { 'data-booking-cta': '' })}
    >
      {label}
    </Button>
  )
}
