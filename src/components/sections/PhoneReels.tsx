import { useReducedMotion } from 'framer-motion'
import { galleryVideos } from '../../data/gallery'
import { FadeIn } from '../ui/Motion'

function PhoneExhibit({
  src,
  poster,
  alt,
  label,
  reduceMotion,
}: {
  src: string
  poster: string
  alt: string
  label: string
  reduceMotion: boolean | null
}) {
  return (
    <div className="group relative shrink-0 snap-center">
      <div className="absolute -inset-10 rounded-full bg-champagne/5 opacity-0 blur-[100px] transition-opacity duration-1000 group-hover:opacity-100" />

      <div className="relative mx-auto w-[230px] md:w-[260px]">
        <div className="absolute -bottom-10 left-1/2 h-10 w-[80%] -translate-x-1/2 scale-x-150 rounded-full bg-black/80 opacity-40 blur-2xl transition-opacity group-hover:opacity-60" />

        <div className="relative h-[480px] overflow-hidden rounded-[3.2rem] bg-zinc-950 p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_50px_100px_-20px_rgba(0,0,0,1)] ring-1 ring-white/10 md:h-[540px]">
          <div className="pointer-events-none absolute inset-0 z-30 rounded-[3.2rem] border border-white/20" />

          <div className="relative z-10 h-full w-full overflow-hidden rounded-[3rem] bg-black p-[4px]">
            {/* Dynamic Island */}
            <div className="absolute left-1/2 top-4 z-40 flex h-5 w-20 -translate-x-1/2 items-center justify-center rounded-full border border-white/10 bg-black shadow-inner">
              <div className="mr-2 h-1.5 w-1.5 rounded-full bg-[#1a1a1a] shadow-inner" />
              <div className="h-1 w-8 rounded-full bg-white/5" />
            </div>

            <div className="relative h-full w-full overflow-hidden rounded-[2.8rem] bg-zinc-900">
              {reduceMotion ? (
                <img
                  src={poster}
                  alt={alt}
                  className="h-full w-full scale-[1.1] object-cover"
                />
              ) : (
                <video
                  className="pointer-events-none h-full w-full scale-[1.1] object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={poster}
                  aria-label={alt}
                >
                  <source src={src} type="video/mp4" />
                </video>
              )}

              <div className="pointer-events-none absolute inset-0 z-20">
                <div className="phone-glare absolute top-0 -left-full h-full w-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/5" />
              </div>
            </div>
          </div>

          {/* Side buttons */}
          <div className="absolute top-24 left-[-2px] h-14 w-[3px] rounded-l-md border-l border-white/10 bg-zinc-800" />
          <div className="absolute top-32 right-[-2px] h-20 w-[3px] rounded-r-md border-r border-white/10 bg-zinc-800" />
        </div>

        <div className="mt-12 flex flex-col items-center text-center">
          <div className="mb-4 h-8 w-px bg-gradient-to-b from-champagne/40 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.8em] text-muted transition-colors duration-500 group-hover:text-champagne">
            Exhibit
          </span>
          <p className="mt-1 font-display text-xl italic text-text/80 transition-colors group-hover:text-text">
            {label}
          </p>
        </div>
      </div>
    </div>
  )
}

export function PhoneReels() {
  const reduce = useReducedMotion()

  return (
    <section
      className="relative overflow-hidden bg-[#020202] py-24 md:py-32"
      aria-labelledby="reels-title"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-[800px] w-full -translate-x-1/2 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse at top, color-mix(in srgb, var(--color-champagne) 12%, transparent), transparent 60%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
        <FadeIn>
          <div className="mb-16 text-center md:mb-24">
            <div className="mb-10 flex flex-col items-center gap-6">
              <span className="text-[10px] font-bold uppercase tracking-[1.2em] text-champagne">
                Cinematic Portfolio
              </span>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-champagne/50 to-transparent" />
            </div>
            <h2
              id="reels-title"
              className="mb-8 font-display text-5xl leading-[0.9] tracking-tight text-text md:text-7xl lg:text-8xl"
            >
              Viva <span className="font-light italic text-muted">In</span>{' '}
              Motion
            </h2>
            <p className="mx-auto max-w-2xl text-xs font-light uppercase leading-[2.2] tracking-[0.35em] text-muted md:text-sm">
              Reels de pe Instagram (@vivastil.22), în chenar de telefon.
            </p>
          </div>
        </FadeIn>

        <div className="flex snap-x snap-mandatory flex-nowrap gap-12 overflow-x-auto px-4 pb-8 scrollbar-none md:gap-16 md:px-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
          {galleryVideos.map((video, index) => (
            <FadeIn key={video.id} delay={index * 0.1} className="snap-center">
              <PhoneExhibit
                src={video.src}
                poster={video.poster}
                alt={video.alt}
                label={`S.0${index + 1}`}
                reduceMotion={reduce}
              />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
