import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export type LightboxItem = {
  src: string
  alt: string
}

type ImageLightboxContextValue = {
  open: (items: LightboxItem[], index?: number) => void
  close: () => void
}

const ImageLightboxContext = createContext<ImageLightboxContextValue | null>(
  null,
)

export function useImageLightbox() {
  const ctx = useContext(ImageLightboxContext)
  if (!ctx) {
    throw new Error('useImageLightbox must be used within ImageLightboxProvider')
  }
  return ctx
}

export function ImageLightboxProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<LightboxItem[]>([])
  const [index, setIndex] = useState(0)
  const open = items.length > 0

  const close = useCallback(() => {
    setItems([])
    setIndex(0)
  }, [])

  const show = useCallback((next: LightboxItem[], start = 0) => {
    if (!next.length) return
    setItems(next)
    setIndex(Math.min(Math.max(start, 0), next.length - 1))
  }, [])

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + items.length) % items.length)
  }, [items.length])

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % items.length)
  }, [items.length])

  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowLeft') prev()
      if (event.key === 'ArrowRight') next()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close, prev, next])

  const value = useMemo(
    () => ({ open: show, close }),
    [show, close],
  )

  const current = items[index]

  return (
    <ImageLightboxContext.Provider value={value}>
      {children}
      {current ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Previzualizare imagine"
          onClick={close}
        >
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-text"
            aria-label="Închide"
            onClick={close}
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          {items.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute left-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-text sm:left-4"
                aria-label="Imaginea anterioară"
                onClick={(event) => {
                  event.stopPropagation()
                  prev()
                }}
              >
                <ChevronLeft size={22} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                className="absolute right-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-text sm:right-4"
                aria-label="Imaginea următoare"
                onClick={(event) => {
                  event.stopPropagation()
                  next()
                }}
              >
                <ChevronRight size={22} strokeWidth={1.5} />
              </button>
            </>
          ) : null}

          <figure
            className="relative max-h-[90vh] max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={current.src}
              alt={current.alt}
              className="max-h-[82vh] w-auto max-w-full object-contain shadow-[var(--shadow-soft)]"
            />
            {items.length > 1 ? (
              <p className="mt-3 text-center text-xs text-muted">
                {index + 1} / {items.length}
              </p>
            ) : null}
          </figure>
        </div>
      ) : null}
    </ImageLightboxContext.Provider>
  )
}

type ZoomableImageProps = {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  loading?: 'lazy' | 'eager'
  /** Dacă e setat, lightbox-ul navighează prin întregul set. */
  gallery?: LightboxItem[]
  galleryIndex?: number
}

/** Imagine clickabilă care se mărește în lightbox. */
export function ZoomableImage({
  src,
  alt,
  className,
  imgClassName,
  loading = 'lazy',
  gallery,
  galleryIndex = 0,
}: ZoomableImageProps) {
  const { open } = useImageLightbox()

  return (
    <button
      type="button"
      className={[
        'block overflow-hidden text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() =>
        open(gallery?.length ? gallery : [{ src, alt }], galleryIndex)
      }
      aria-label={`Mărește imaginea: ${alt}`}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={imgClassName}
      />
    </button>
  )
}
