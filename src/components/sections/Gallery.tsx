import { useState } from 'react'
import { galleryImages, type GalleryImage } from '../../data/gallery'
import { FadeIn, Stagger, StaggerItem } from '../ui/Motion'
import { Lightbox } from '../ui/Lightbox'
import { SectionHeading } from '../ui/SectionHeading'

/** Pe telefon: toate celulele egale (fără goluri). De la md în sus: layout variat. */
function tileClass(span?: GalleryImage['span']) {
  const mobile = 'col-span-1 aspect-[3/4]'

  if (span === 'wide') {
    return `${mobile} md:col-span-2 md:aspect-[16/10]`
  }
  if (span === 'tall') {
    return `${mobile} md:row-span-2 md:aspect-auto md:h-full md:min-h-0`
  }
  return `${mobile} md:aspect-[4/5]`
}

export function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <section
      id="galerie"
      className="bg-bg py-24 sm:py-28 lg:py-32"
      aria-labelledby="galerie-title"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
        <FadeIn>
          <SectionHeading
            as="h1"
            eyebrow="Galerie"
            title="Un strop din universul Viva Stil"
            subtitle="Imagini reale din studio — Google Maps și Instagram (@vivastil.22)."
            className="mb-14"
          />
        </FadeIn>

        <Stagger className="grid auto-rows-fr grid-cols-2 gap-1.5 sm:gap-2 md:grid-cols-3 md:gap-3 md:auto-rows-[minmax(12rem,1fr)] lg:grid-cols-4">
          {galleryImages.map((image, index) => (
            <StaggerItem key={image.id} className={`min-h-0 ${tileClass(image.span)}`}>
              <button
                type="button"
                className="group relative block h-full w-full overflow-hidden bg-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne"
                onClick={() => setActiveIndex(index)}
                aria-label={`Deschide imaginea: ${image.alt}`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 ease-out group-hover:scale-110 group-hover:grayscale-0"
                />
                <span className="absolute inset-0 bg-black/20 opacity-60 transition-opacity duration-500 group-hover:opacity-0" />
                <span className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-[11px] text-text opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 sm:p-4 sm:text-sm">
                  {image.alt}
                </span>
              </button>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <Lightbox
        image={activeIndex === null ? null : galleryImages[activeIndex]}
        onClose={() => setActiveIndex(null)}
        onPrev={() =>
          setActiveIndex((current) =>
            current === null
              ? current
              : (current - 1 + galleryImages.length) % galleryImages.length,
          )
        }
        onNext={() =>
          setActiveIndex((current) =>
            current === null ? current : (current + 1) % galleryImages.length,
          )
        }
      />
    </section>
  )
}
