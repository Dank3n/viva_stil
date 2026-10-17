import { Link } from 'react-router-dom'
import { businessInfo } from '../../config/business'
import { navLinks } from '../../data/content'
import { BrandLogo } from '../ui/BrandLogo'
import { SocialLinks } from '../ui/SocialLinks'

export function Footer() {
  return (
    <footer className="border-t border-line bg-elevated text-text">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:px-10 lg:py-20">
        <div>
          <Link to="/" className="inline-flex items-center">
            <BrandLogo heightClassName="h-16 sm:h-20" />
          </Link>
          <p className="mt-6 max-w-sm font-display text-2xl italic text-champagne-soft">
            {businessInfo.tagline}
          </p>
          <SocialLinks className="mt-8" />
        </div>

        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-champagne-soft">
              Explorează
            </p>
            <ul className="mt-4 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted transition-colors hover:text-text"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/programari"
                  className="text-sm text-muted transition-colors hover:text-text"
                >
                  Programări
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-champagne-soft">
              Conectare
            </p>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  to="/programari"
                  className="text-sm text-muted transition-colors hover:text-text"
                >
                  Programări
                </Link>
              </li>
              <li>
                <Link
                  to="/cont"
                  className="text-sm text-muted transition-colors hover:text-text"
                >
                  Contul meu
                </Link>
              </li>
              {businessInfo.phone ? (
                <li>
                  <a
                    href={`tel:${businessInfo.phone.replace(/\s+/g, '')}`}
                    className="text-sm text-muted transition-colors hover:text-text"
                  >
                    {businessInfo.phone}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>© 2026 {businessInfo.name}. Toate drepturile rezervate.</p>
          <p className="text-muted/70">Beauty · Care · Confidence</p>
        </div>
      </div>
    </footer>
  )
}
