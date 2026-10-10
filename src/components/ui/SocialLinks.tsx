import type { ReactNode } from 'react'
import { businessInfo } from '../../config/business'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M14 8h2.5V5.5H14c-1.93 0-3.5 1.57-3.5 3.5V11H8v2.5h2.5V20H13v-6.5h2.25L16 11h-3V9c0-.55.45-1 1-1Z" />
    </svg>
  )
}

type SocialLinksProps = {
  className?: string
  iconClassName?: string
  size?: 'md' | 'sm'
}

export function SocialLinks({
  className,
  iconClassName,
  size = 'md',
}: SocialLinksProps) {
  const iconSize = iconClassName ?? (size === 'sm' ? 'h-4 w-4' : 'h-5 w-5')
  const hitSize = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11'
  const gap = size === 'sm' ? 'gap-1.5' : 'gap-3'

  const links = [
    businessInfo.instagramUrl
      ? {
          href: businessInfo.instagramUrl,
          label: 'Instagram',
          icon: <InstagramIcon className={iconSize} />,
        }
      : null,
    businessInfo.facebookUrl
      ? {
          href: businessInfo.facebookUrl,
          label: 'Facebook',
          icon: <FacebookIcon className={iconSize} />,
        }
      : null,
  ].filter(Boolean) as Array<{
    href: string
    label: string
    icon: ReactNode
  }>

  if (!links.length) return null

  return (
    <div className={['flex items-center', gap, className].filter(Boolean).join(' ')}>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className={[
            'inline-flex items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-champagne/50 hover:text-champagne-soft',
            hitSize,
          ].join(' ')}
        >
          {link.icon}
        </a>
      ))}
    </div>
  )
}
