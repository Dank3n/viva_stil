import { ArrowUpRight, Clock, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { businessInfo } from '../../config/business'
import { FadeIn, Stagger, StaggerItem } from '../ui/Motion'
import { SectionHeading } from '../ui/SectionHeading'
import { SocialLinks } from '../ui/SocialLinks'

function Field({
  label,
  value,
  href,
  emptyHint,
}: {
  label: string
  value: string
  href?: string
  emptyHint: string
}) {
  if (!value) {
    return (
      <div>
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-taupe">
          {label}
        </p>
        <p className="mt-2 text-sm text-taupe/70">{emptyHint}</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-taupe">
        {label}
      </p>
      {href ? (
        <a
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="mt-2 inline-block text-base text-ink transition-colors hover:text-champagne"
        >
          {value}
        </a>
      ) : (
        <p className="mt-2 text-base text-ink">{value}</p>
      )}
    </div>
  )
}

export function Contact() {
  const scheduleFilled = businessInfo.schedule.some((item) => item.hours)

  return (
    <section id="contact" className="bg-nude/30 py-24 sm:py-28 lg:py-32" aria-labelledby="contact-title">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
        <FadeIn>
          <SectionHeading as="h1" title="Contact" subtitle="Suntem aici când ești gata pentru următorul tău ritual de frumusețe." className="mb-14" />
        </FadeIn>

        <Stagger className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <StaggerItem>
            <article className="h-full border border-line bg-surface/90 p-7">
              <MapPin className="text-champagne" size={22} strokeWidth={1.4} aria-hidden />
              <h3 className="mt-5 font-display text-2xl text-ink">Adresă</h3>
              <div className="mt-4">
                <Field
                  label="Locație"
                  value={[businessInfo.address, businessInfo.city].filter(Boolean).join(', ')}
                  emptyHint="Adresa studio-ului va fi afișată aici."
                />
              </div>
            </article>
          </StaggerItem>

          <StaggerItem>
            <article className="h-full border border-line bg-surface/90 p-7">
              <Phone className="text-champagne" size={22} strokeWidth={1.4} aria-hidden />
              <h3 className="mt-5 font-display text-2xl text-ink">Telefon & social</h3>
              <div className="mt-4 space-y-5">
                <Field
                  label="Telefon"
                  value={businessInfo.phone}
                  href={businessInfo.phone ? `tel:${businessInfo.phone.replace(/\s+/g, '')}` : undefined}
                  emptyHint="Numărul de telefon va fi afișat aici."
                />
                <div>
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-taupe">
                    Social
                  </p>
                  <SocialLinks className="mt-3" />
                </div>
              </div>
            </article>
          </StaggerItem>

          <StaggerItem>
            <article className="h-full border border-line bg-surface/90 p-7 md:col-span-2 xl:col-span-1">
              <Clock className="text-champagne" size={22} strokeWidth={1.4} aria-hidden />
              <h3 className="mt-5 font-display text-2xl text-ink">Program</h3>
              <div className="mt-4 space-y-4">
                {scheduleFilled ? (
                  businessInfo.schedule.map((item) => (
                    <div key={item.days} className="flex items-baseline justify-between gap-4 text-sm">
                      <span className="text-taupe">{item.days}</span>
                      <span className="text-ink">{item.hours}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-taupe/70">
                    Programul de lucru va fi afișat aici.
                  </p>
                )}
                <Link
                  to="/programari"
                  data-booking-cta=""
                  className="inline-flex items-center gap-2 pt-2 text-sm font-medium text-ink transition-colors hover:text-champagne"
                >
                  Programează-te online
                  <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden />
                </Link>
              </div>
            </article>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  )
}
