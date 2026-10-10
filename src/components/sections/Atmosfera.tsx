import { useEffect, useRef, useState } from 'react'
import { galleryImages } from '../../data/gallery'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { FadeIn } from '../ui/Motion'
import { useImageLightbox } from '../ui/ImageLightbox'

const panels = [
  { image: galleryImages[0], alt: 'Fațadă Viva Stil' },
  { image: galleryImages[2], alt: 'Look final Viva Stil' },
  { image: galleryImages[3], alt: 'Exterior Viva Stil seara' },
]

export function Atmosfera() {
  const { open } = useImageLightbox()
  const isMobile = useMediaQuery('(max-width: 1023px)')
  const [activeIndex, setActiveIndex] = useState(0)
  const panelRefs = useRef<(HTMLButtonElement | null)[]>([])

  const lightboxItems = panels.map((p) => ({
    src: p.image.src,
    alt: p.alt,
  }))

  useEffect(() => {
    if (!isMobile) return

    const ratios = new Map<number, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.index)
          if (Number.isNaN(index)) continue
          ratios.set(index, entry.isIntersecting ? entry.intersectionRatio : 0)
        }

        let best = 0
        let bestRatio = -1
        for (const [index, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio
            best = index
          }
        }
        if (bestRatio > 0.2) setActiveIndex(best)
      },
      {
        root: null,
        rootMargin: '-18% 0px -28% 0px',
        threshold: [0, 0.25, 0.4, 0.55, 0.7, 0.85, 1],
      },
    )

    panelRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [isMobile])

  return (
    <section
      className="relative overflow-hidden bg-bg py-20 sm:py-24"
      aria-labelledby="atmosfera-title"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle at top right, color-mix(in srgb, var(--color-champagne) 18%, transparent), transparent 55%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
        <FadeIn>
          <div className="flex flex-col gap-8 lg:h-[600px] lg:flex-row">
            <div className="flex flex-col justify-center rounded-2xl border border-line bg-elevated/80 p-8 shadow-[var(--shadow-soft)] backdrop-blur-md sm:p-10 lg:w-1/3 lg:p-12">
              <h2
                id="atmosfera-title"
                className="text-3xl font-bold uppercase leading-tight tracking-[0.12em] text-text sm:text-4xl"
              >
                Atmosfera
                <br />
                <span className="text-champagne">Viva</span>
              </h2>
              <div className="my-8 h-1 w-16 bg-champagne" />
              <h3 className="mb-4 text-lg font-semibold uppercase tracking-wide text-text-soft sm:text-xl">
                Lux, confort și stil combinate.
              </h3>
              <p className="text-base leading-relaxed text-muted">
                Pășiți într-un spațiu conceput pentru relaxare și rafinament.
                Interiorul nostru modern combină stilul industrial chic cu
                tonuri calde și primitoare pentru a ne asigura că vizita
                dumneavoastră nu este doar un serviciu, ci o experiență.
              </p>
            </div>

            <div className="flex h-[500px] flex-col gap-2 lg:h-full lg:w-2/3 lg:flex-row">
              {panels.map((panel, index) => {
                const active = activeIndex === index
                return (
                  <button
                    key={panel.image.id}
                    ref={(el) => {
                      panelRefs.current[index] = el
                    }}
                    type="button"
                    data-index={index}
                    onClick={() => open(lightboxItems, index)}
                    onMouseEnter={() => {
                      if (!isMobile) setActiveIndex(index)
                    }}
                    onFocus={() => {
                      if (!isMobile) setActiveIndex(index)
                    }}
                    aria-label={`Mărește imaginea: ${panel.alt}`}
                    aria-current={active ? 'true' : undefined}
                    className={[
                      'relative cursor-pointer overflow-hidden rounded-xl transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne',
                      active ? 'flex-[3]' : 'flex-1',
                    ].join(' ')}
                  >
                    <img
                      src={panel.image.src}
                      alt={panel.alt}
                      loading="lazy"
                      className={[
                        'absolute inset-0 h-full w-full object-cover transition-transform duration-1000',
                        active ? 'scale-105' : 'scale-100',
                      ].join(' ')}
                    />
                    <div
                      className={[
                        'absolute inset-0 transition-colors duration-500',
                        active ? 'bg-transparent' : 'bg-black/60',
                      ].join(' ')}
                    />
                    <div
                      className={[
                        'pointer-events-none absolute inset-0 rounded-xl border-2 border-champagne transition-opacity duration-500',
                        active ? 'opacity-100' : 'opacity-0',
                      ].join(' ')}
                    />
                    <div
                      className={[
                        'absolute bottom-6 left-6 transition-all duration-500',
                        active
                          ? 'translate-y-0 opacity-100'
                          : 'translate-y-4 opacity-0',
                      ].join(' ')}
                    >
                      <span className="rounded-sm bg-champagne px-3 py-1 text-xs font-bold uppercase tracking-widest text-bg">
                        Viva View
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
