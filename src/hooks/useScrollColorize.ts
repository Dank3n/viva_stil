import { useEffect, useRef, useState } from 'react'

/**
 * Pe mobil: imaginea e colorată când e în banda centrală a viewport-ului,
 * altfel alb-negru. Pe desktop nu setează starea (caller folosește hover).
 */
export function useScrollColorize<T extends HTMLElement = HTMLElement>(
  enabled: boolean,
) {
  const ref = useRef<T | null>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setActive(false)
      return
    }

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting && entry.intersectionRatio >= 0.4)
      },
      {
        // Bandă vizuală aproximativ pe mijlocul ecranului
        root: null,
        rootMargin: '-22% 0px -28% 0px',
        threshold: [0, 0.25, 0.4, 0.55, 0.75, 1],
      },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [enabled])

  return { ref, active }
}
