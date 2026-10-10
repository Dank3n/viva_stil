import { FadeIn } from '../ui/Motion'

export function BrandStatement() {
  return (
    <section className="relative overflow-hidden bg-nude/40 py-24 sm:py-28 lg:py-32" aria-labelledby="brand-title">
      <div className="editorial-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <FadeIn>
          <p className="mb-4 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-taupe">
            Filosofia noastră
          </p>
          <h2
            id="brand-title"
            className="font-display text-4xl font-medium leading-[1.15] text-ink text-balance sm:text-5xl"
          >
            Mai mult decât frumusețe. O experiență.
          </h2>
          <p className="mt-8 text-base leading-relaxed text-taupe sm:text-lg">
            La Viva Stil, fiecare detaliu este gândit pentru tine.
            Credem într-o frumusețe care începe cu starea de bine, continuă cu
            grijă și se vede în încrederea cu care pleci de la noi.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
