import { Menu, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { businessInfo } from '../../config/business'
import { navLinks } from '../../data/content'
import { useScrolled } from '../../hooks/useMotion'
import { BookCta } from '../ui/BookCta'
import { BrandLogo } from '../ui/BrandLogo'

export function Navbar() {
  const scrolled = useScrolled(16)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const menuId = useId()
  const locationKey = location.pathname

  const [lastLocationKey, setLastLocationKey] = useState(locationKey)
  if (lastLocationKey !== locationKey) {
    setLastLocationKey(locationKey)
    if (open) setOpen(false)
  }

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const isHome = location.pathname === '/'
  const solidNav = !isHome || scrolled || open

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        solidNav
          ? 'border-b border-line bg-bg/85 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.65)] backdrop-blur-xl'
          : 'bg-transparent',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
        <Link
          to="/"
          className="group inline-flex items-center"
          aria-label={`${businessInfo.name} — acasă`}
          onClick={() => setOpen(false)}
        >
          <BrandLogo
            heightClassName="h-14 sm:h-16"
            className="transition-opacity group-hover:opacity-90"
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigare principală">
          {navLinks.map((link) => {
            const active =
              link.href === '/'
                ? location.pathname === '/'
                : location.pathname === link.href ||
                  location.pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                to={link.href}
                className={[
                  'text-[0.8rem] font-medium uppercase tracking-[0.18em] transition-colors',
                  active ? 'text-text' : 'text-muted hover:text-text',
                ].join(' ')}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden lg:block">
          <BookCta size="md" />
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface/70 text-text lg:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? 'Închide meniul' : 'Deschide meniul'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
        </button>
      </div>

      <div
        id={menuId}
        className={[
          'border-t border-line bg-bg/95 backdrop-blur-xl lg:hidden',
          open ? 'block' : 'hidden',
        ].join(' ')}
      >
        <nav
          className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-6 sm:px-8"
          aria-label="Navigare mobilă"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="rounded-2xl px-4 py-3 text-base text-text transition-colors hover:bg-surface"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 px-1">
            <BookCta className="w-full" size="lg" />
          </div>
        </nav>
      </div>
    </header>
  )
}
