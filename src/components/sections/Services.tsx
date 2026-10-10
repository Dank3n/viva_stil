import { Clock } from 'lucide-react'
import { useState } from 'react'
import { servicesByCategory } from '../../data/services'
import { BookCta } from '../ui/BookCta'
import { FadeIn, Stagger, StaggerItem } from '../ui/Motion'
import { SectionHeading } from '../ui/SectionHeading'

export function Services() {
  const groups = servicesByCategory()
  const [activeCategory, setActiveCategory] = useState(groups[0]?.category ?? '')
  const activeGroup = groups.find((group) => group.category === activeCategory)

  return (
    <section
      id="servicii"
      className="bg-bg py-24 sm:py-28 lg:py-32"
      aria-labelledby="servicii-title"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
        <FadeIn>
          <SectionHeading
            as="h1"
            title="Serviciile noastre"
            subtitle="Alege o categorie, apoi programează-te — ajungi direct la rezervare cu serviciul selectat."
            className="mb-10"
          />
        </FadeIn>

        <FadeIn delay={0.05}>
          <div
            className="relative mb-12"
            role="tablist"
            aria-label="Categorii servicii"
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-bg to-transparent sm:hidden" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-bg to-transparent sm:hidden" />

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
              {groups.map((group) => {
                const selected = group.category === activeCategory
                return (
                  <button
                    key={group.category}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    id={`tab-${group.category}`}
                    onClick={() => setActiveCategory(group.category)}
                    className={[
                      'shrink-0 rounded-full border px-4 py-2.5 text-xs font-medium uppercase tracking-[0.14em] transition-all duration-300 sm:text-[0.7rem]',
                      selected
                        ? 'border-champagne bg-champagne text-bg'
                        : 'border-line bg-transparent text-muted hover:border-champagne/50 hover:text-text',
                    ].join(' ')}
                  >
                    {group.category}
                  </button>
                )
              })}
            </div>
          </div>
        </FadeIn>

        {activeGroup ? (
          <div
            role="tabpanel"
            aria-labelledby={`tab-${activeGroup.category}`}
            key={activeGroup.category}
          >
            <FadeIn>
              <h2 className="mb-8 font-display text-3xl text-text sm:text-4xl">
                {activeGroup.category}
              </h2>
            </FadeIn>

            <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {activeGroup.items.map((service) => (
                <StaggerItem key={service.id}>
                  <article className="group flex h-full flex-col border border-line bg-elevated/60 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-champagne/50 hover:shadow-[var(--shadow-lift)] sm:p-7">
                    <h3 className="font-display text-2xl text-text">
                      {service.name}
                    </h3>
                    {service.description ? (
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                        {service.description}
                      </p>
                    ) : (
                      <div className="flex-1" />
                    )}

                    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
                      {service.duration ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={14} strokeWidth={1.5} aria-hidden />
                          {service.duration}
                        </span>
                      ) : null}
                      {service.price ? (
                        <span className="font-medium text-champagne-soft">
                          {service.price}
                        </span>
                      ) : (
                        <span>La cerere</span>
                      )}
                    </div>

                    <div className="mt-6">
                      <BookCta
                        variant="primary"
                        className="cta-highlight w-full font-semibold tracking-[0.06em]"
                        label="Programează-te"
                        serviceId={service.id}
                      />
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        ) : null}
      </div>
    </section>
  )
}
