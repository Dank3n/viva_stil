import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { businessInfo } from '../../config/business'
import { heroImage, heroVideos } from '../../data/gallery'
import { BookCta } from '../ui/BookCta'
import { Button } from '../ui/Button'

const FADE_MS = 1400

export function Hero() {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const switching = useRef(false)

  useEffect(() => {
    if (reduce) return

    const current = videoRefs.current[active]
    if (!current) return

    const playSafe = (el: HTMLVideoElement | null) => {
      if (!el) return
      const p = el.play()
      if (p && typeof p.catch === 'function') p.catch(() => {})
    }

    playSafe(current)

    const onTimeUpdate = () => {
      if (switching.current) return
      const duration = current.duration
      if (!Number.isFinite(duration) || duration <= 0) return

      const remaining = duration - current.currentTime
      if (remaining > FADE_MS / 1000 + 0.05) return

      switching.current = true
      const next = (active + 1) % heroVideos.length
      const nextEl = videoRefs.current[next]
      if (nextEl) {
        nextEl.currentTime = 0
        playSafe(nextEl)
      }
      setActive(next)

      window.setTimeout(() => {
        const prev = videoRefs.current[active]
        if (prev) {
          prev.pause()
          prev.currentTime = 0
        }
        switching.current = false
      }, FADE_MS + 80)
    }

    current.addEventListener('timeupdate', onTimeUpdate)
    return () => current.removeEventListener('timeupdate', onTimeUpdate)
  }, [active, reduce])

  return (
    <section
      id="acasa"
      className="relative min-h-[100svh] overflow-hidden bg-bg"
      aria-labelledby="hero-title"
    >
      <div className="absolute inset-0">
        {reduce ? (
          <img
            src={heroVideos[0].poster || heroImage.src}
            alt={heroImage.alt}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <>
            {heroVideos.map((clip, index) => (
              <video
                key={clip.src}
                ref={(el) => {
                  videoRefs.current[index] = el
                }}
                className="absolute inset-0 h-full w-full object-cover object-center transition-opacity ease-in-out"
                style={{
                  opacity: active === index ? 1 : 0,
                  transitionDuration: `${FADE_MS}ms`,
                }}
                muted
                playsInline
                preload="auto"
                poster={clip.poster}
                aria-hidden={active !== index}
                aria-label={active === index ? heroImage.alt : undefined}
              >
                <source src={clip.src} type="video/mp4" />
              </video>
            ))}
            <motion.div
              className="pointer-events-none absolute inset-0"
              initial={{ opacity: 0.35 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/35" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl items-center px-5 pb-28 pt-32 sm:px-8 sm:pb-28 lg:px-10 lg:pb-24 lg:pt-28">
        <div className="max-w-xl text-text">
          <motion.h1
            id="hero-title"
            className="font-display text-5xl font-medium leading-[1.05] text-balance sm:text-6xl lg:text-7xl"
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Frumusețea ta, în ritmul tău.
          </motion.h1>

          <motion.p
            className="mt-6 max-w-md text-base leading-relaxed text-text/80 sm:text-lg"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.4 }}
          >
            Descoperă experiența {businessInfo.name} — un spațiu dedicat
            frumuseții, îngrijirii și stării tale de bine.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
          >
            <BookCta size="lg" />
            <Button to="/servicii" variant="outlineLight" size="lg">
              Descoperă serviciile
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
