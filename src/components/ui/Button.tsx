import { Link } from 'react-router-dom'
import type { ComponentProps, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'inverse' | 'outlineLight'
type ButtonSize = 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-champagne text-bg hover:bg-champagne-soft shadow-[var(--shadow-lift)] hover:-translate-y-0.5',
  secondary:
    'bg-transparent text-text border border-line hover:border-champagne hover:text-text',
  ghost: 'bg-surface text-text hover:bg-elevated',
  inverse:
    'bg-text text-bg hover:bg-text-soft shadow-[var(--shadow-lift)] hover:-translate-y-0.5',
  outlineLight:
    'bg-transparent text-text border border-text/25 hover:border-champagne-soft hover:text-text',
}

const sizes: Record<ButtonSize, string> = {
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-3.5 text-sm sm:text-[0.95rem]',
}

type CommonProps = {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<'button'>, 'children' | 'className'> & {
    href?: undefined
    to?: undefined
  }

type ButtonAsAnchor = CommonProps &
  Omit<ComponentProps<'a'>, 'children' | 'className' | 'href'> & {
    href: string
    to?: undefined
  }

type ButtonAsLink = CommonProps & {
  to: string
  href?: undefined
  target?: string
  rel?: string
  onClick?: () => void
  [dataAttr: `data-${string}`]: string | undefined
}

type ButtonProps = ButtonAsButton | ButtonAsAnchor | ButtonAsLink

function classes(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
) {
  return [
    'inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 ease-out',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-champagne',
    variants[variant],
    sizes[size],
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

export function Button(props: ButtonProps) {
  const { children, variant = 'primary', size = 'md', className } = props
  const cls = classes(variant, size, className)

  if ('to' in props && props.to) {
    const { to, onClick, children: _c, variant: _v, size: _s, className: _cl, href: _h, ...rest } =
      props
    return (
      <Link to={to} className={cls} onClick={onClick} {...rest}>
        {children}
      </Link>
    )
  }

  if ('href' in props && props.href) {
    const { href, target, rel, ...rest } = props
    return (
      <a href={href} target={target} rel={rel} className={cls} {...rest}>
        {children}
      </a>
    )
  }

  const { type = 'button', ...rest } = props as ButtonAsButton
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  )
}
