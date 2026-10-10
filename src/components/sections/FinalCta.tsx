import { finalCtaImage } from '../../data/gallery'
import { BookCta } from '../ui/BookCta'
import { FadeIn } from '../ui/Motion'

export function FinalCta() {
  return (
    <section
      className="relative overflow-hidden py-28 sm:py-32 lg:py-36"
      aria-labelledby="final-cta-title"
    >
      <div className="absolute inset-0" aria-hidden>
        <img
          src={finalCtaImage.src}
          alt=""
          className="h-full w-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/55 to-black/45" />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <FadeIn>
          <h2
            id="final-cta-title"
            className="font-display text-4xl font-medium leading-[1.15] text-text text-balance sm:text-5xl"
          >
            Următorul tău moment de răsfăț începe aici.
          </h2>
          <p className="mt-5 text-lg text-text/80">Fă-ți timp pentru tine.</p>
          <div className="mt-10">
            <BookCta label="Programează-te acum" size="lg" />
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
