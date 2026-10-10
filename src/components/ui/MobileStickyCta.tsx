import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { BookCta } from './BookCta'

const SELECTOR = '[data-booking-cta]'

function isShownInViewport(el: Element) {
  const style = window.getComputedStyle(el)
  if (style.display === 'none' || style.visibility === 'hidden') return false
  if (Number(style.opacity) === 0) return false
  const rect = el.getBoundingClientRect()
  const vh = window.innerHeight || document.documentElement.clientHeight
  // Vizibil dacă intersectează zona utilă (exclude banda sticky de jos)
  return rect.bottom > 0 && rect.top < vh * 0.92 && rect.height > 0
}

export function MobileStickyCta() {
  const { pathname } = useLocation()
  const [otherCtaVisible, setOtherCtaVisible] = useState(true)

  useEffect(() => {
    if (pathname === '/programari') return

    const visible = new Map<Element, boolean>()

    const sync = () => {
      setOtherCtaVisible([...visible.values()].some(Boolean))
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(
            entry.target,
            entry.isIntersecting && isShownInViewport(entry.target),
          )
        }
        sync()
      },
      { root: null, threshold: [0, 0.15, 0.35], rootMargin: '0px 0px -10% 0px' },
    )

    const observeAll = () => {
      observer.disconnect()
      visible.clear()
      document.querySelectorAll(SELECTOR).forEach((el) => {
        visible.set(el, isShownInViewport(el))
        observer.observe(el)
      })
      sync()
    }

    observeAll()

    let debounceId = 0
    const mutation = new MutationObserver(() => {
      window.clearTimeout(debounceId)
      debounceId = window.setTimeout(observeAll, 120)
    })
    mutation.observe(document.body, { childList: true, subtree: true })

    const onScrollOrResize = () => {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (visible.has(el)) visible.set(el, isShownInViewport(el))
      })
      sync()
    }
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)

    return () => {
      observer.disconnect()
      mutation.disconnect()
      window.clearTimeout(debounceId)
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [pathname])

  if (pathname === '/programari') return null
  if (otherCtaVisible) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 p-4 lg:hidden">
      <div className="pointer-events-auto mx-auto max-w-md">
        <BookCta
          stickySelf
          className="w-full shadow-[var(--shadow-soft)]"
          size="lg"
          label="Programează-te"
        />
      </div>
    </div>
  )
}
