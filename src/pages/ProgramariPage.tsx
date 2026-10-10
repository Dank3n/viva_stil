import { useEffect } from 'react'
import { BookingWizard } from '../components/booking/BookingWizard'
import { FadeIn } from '../components/ui/Motion'
import { businessInfo } from '../config/business'

export function ProgramariPage() {
  useEffect(() => {
    document.title = `Programări — ${businessInfo.name}`
    return () => {
      document.title = businessInfo.seo.title
    }
  }, [])

  return (
    <div className="bg-bg pt-28 sm:pt-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8 lg:px-10">
        <FadeIn>
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-taupe">
            Programări
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.12] text-text text-balance sm:text-5xl">
            Rezervă-ți momentul pentru tine.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Alege serviciul, specialistul și intervalul potrivit — confirmarea
            vine pe loc.
          </p>
        </FadeIn>

        <div className="mt-10 pb-20">
          <BookingWizard />
        </div>
      </div>
    </div>
  )
}
