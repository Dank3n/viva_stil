import { galleryImages } from '../../data/gallery'
import { FadeIn } from '../ui/Motion'

const panels = [
  { image: galleryImages[0], alt: 'Fațadă Viva Stil' },
  { image: galleryImages[2], alt: 'Look final Viva Stil' },
  { image: galleryImages[3], alt: 'Exterior Viva Stil seara' },
]

export function Atmosfera() {
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
              {panels.map((panel) => (
                <article
                  key={panel.image.id}
                  className="group relative flex-1 cursor-pointer overflow-hidden rounded-xl transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] hover:flex-[3]"
                >
                  <img
                    src={panel.image.src}
                    alt={panel.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 transition-colors duration-500 group-hover:bg-transparent" />
                  <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-champagne opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute bottom-6 left-6 translate-y-4 opacity-0 transition-all duration-500 delay-100 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="rounded-sm bg-champagne px-3 py-1 text-xs font-bold uppercase tracking-widest text-bg">
                      Viva View
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
