import { galleryImages, type GalleryImage } from '../../data/gallery'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useScrollColorize } from '../../hooks/useScrollColorize'
import { FadeIn, Stagger, StaggerItem } from '../ui/Motion'
import { useImageLightbox } from '../ui/ImageLightbox'
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

function GalleryTile({
  image,
  index,
  isMobile,
  onOpen,
}: {
  image: GalleryImage
  index: number
  isMobile: boolean
  onOpen: (index: number) => void
}) {
  const { ref, active } = useScrollColorize<HTMLButtonElement>(isMobile)

  const colorize = isMobile
    ? active
      ? 'grayscale-0 scale-105'
      : 'grayscale scale-100'
    : 'grayscale group-hover:scale-110 group-hover:grayscale-0'

  const overlay = isMobile
    ? active
      ? 'opacity-0'
      : 'opacity-60'
    : 'opacity-60 group-hover:opacity-0'

  return (
    <StaggerItem className={`min-h-0 ${tileClass(image.span)}`}>
      <button
        ref={ref}
        type="button"
        className="group relative block h-full w-full overflow-hidden bg-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne"
        onClick={() => onOpen(index)}
        aria-label={`Mărește imaginea: ${image.alt}`}
      >
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          className={[
            'absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out',
            colorize,
          ].join(' ')}
        />
        <span
          className={[
            'absolute inset-0 bg-black/20 transition-opacity duration-500',
            overlay,
          ].join(' ')}
        />
      </button>
    </StaggerItem>
  )
}

export function Gallery() {
  const { open } = useImageLightbox()
  const isMobile = useMediaQuery('(max-width: 767px)')

  const lightboxItems = galleryImages.map(({ src, alt }) => ({ src, alt }))

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
            <GalleryTile
              key={image.id}
              image={image}
              index={index}
              isMobile={isMobile}
              onOpen={(i) => open(lightboxItems, i)}
            />
          ))}
        </Stagger>
      </div>
    </section>
  )
}
