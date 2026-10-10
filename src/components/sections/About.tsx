import { aboutValues } from '../../data/content'
import { aboutImage } from '../../data/gallery'
import { FadeIn, Stagger, StaggerItem } from '../ui/Motion'
import { SectionHeading } from '../ui/SectionHeading'

export function About() {
  return (
    <section id="despre" className="bg-ivory py-24 sm:py-28 lg:py-32" aria-labelledby="despre-title">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-10">
        <FadeIn className="relative">
          <div className="overflow-hidden">
            <img
              src={aboutImage.src}
              alt={aboutImage.alt}
              className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-4 hidden h-40 w-40 border border-champagne/50 sm:block lg:-right-8" aria-hidden />
        </FadeIn>

        <div>
          <SectionHeading
            align="left"
            as="h1"
            title="Un studio creat pentru momentele tale de răsfăț."
            className="mb-8"
          />
          <FadeIn delay={0.1}>
            <p className="max-w-lg text-base leading-relaxed text-taupe">
              Intră într-un spațiu calm, aerisit și elegant — gândit să te
              încetinească și să te reconecteze cu tine. La Viva Stil, frumusețea
              nu e o cursă, ci un ritual blând.
            </p>
          </FadeIn>

          <Stagger className="mt-12 grid gap-8" delay={0.15}>
            {aboutValues.map((value) => (
              <StaggerItem key={value.title}>
                <article className="border-l border-champagne pl-5">
                  <h3 className="font-display text-2xl text-ink">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-taupe">
                    {value.description}
                  </p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  )
}
