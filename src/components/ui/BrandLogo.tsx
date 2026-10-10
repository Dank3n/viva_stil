import { businessInfo } from '../../config/business'

type BrandLogoProps = {
  className?: string
  heightClassName?: string
}

/**
 * Logo original Viva Stil — frizerie.
 * VIVA / foarfecă / STIL — tipografie + emblemă (SVG, fundal transparent).
 */
export function BrandLogo({
  className,
  heightClassName = 'h-12 sm:h-14',
}: BrandLogoProps) {
  return (
    <span
      className={[
        'inline-flex flex-col items-start justify-center text-text',
        heightClassName,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="img"
      aria-label={businessInfo.name}
    >
      <span className="font-display text-[1.6em] font-semibold leading-none tracking-[0.2em]">
        VIVA
      </span>

      <svg
        viewBox="0 0 140 20"
        className="my-[0.32em] h-[0.5em] w-[5.6em] text-champagne"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* linie + foarfecă centrală */}
        <line x1="4" y1="10" x2="52" y2="10" />
        <line x1="88" y1="10" x2="136" y2="10" />
        {/* foarfecă */}
        <g fill="currentColor" stroke="none">
          <circle cx="62" cy="6" r="3.2" />
          <circle cx="62" cy="14" r="3.2" />
          <path d="M65.2 7.2 78 10l-12.8 2.8c1.2-1.6 1.2-4 0-5.6z" />
          <path d="M78 10h8l8-5.5v11L86 10H78z" />
        </g>
      </svg>

      <span className="pl-[0.08em] text-[0.68em] font-semibold uppercase leading-none tracking-[0.5em] text-champagne">
        Stil
      </span>
    </span>
  )
}
