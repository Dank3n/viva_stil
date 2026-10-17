import { Link } from 'react-router-dom'
import { useAuth } from '../account/AuthContext'
import { AppointmentHistory } from '../components/account/AppointmentHistory'
import { AuthPanel } from '../components/account/AuthPanel'
import { FadeIn } from '../components/ui/Motion'
import { usePageTitle } from '../hooks/usePageTitle'

export function ContPage() {
  usePageTitle('Programările tale')
  const { user } = useAuth()

  return (
    <div className="bg-bg pt-28 sm:pt-32">
      <div className="mx-auto max-w-3xl px-5 pb-20 sm:px-8 lg:px-10">
        <FadeIn>
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-taupe">
            Cont client
          </p>
          <h1 className="mt-4 font-display text-4xl font-medium leading-[1.12] text-text text-balance sm:text-5xl">
            Programările tale
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Autentifică-te ca să vezi istoricul vizitelor și să lași recenzii
            detaliate cu stele după fiecare serviciu.
          </p>
        </FadeIn>

        <div className="mt-10">
          {user ? <AppointmentHistory /> : <AuthPanel />}
        </div>

        {!user ? (
          <p className="mt-8 text-center text-sm text-muted">
            Nu ai cont încă? Poți și{' '}
            <Link
              to="/programari"
              className="text-champagne-soft underline-offset-2 hover:underline"
            >
              programa o vizită
            </Link>{' '}
            — apoi creezi cont cu același telefon.
          </p>
        ) : (
          <p className="mt-10 text-center text-sm text-muted">
            <Link
              to="/programari"
              className="text-champagne-soft underline-offset-2 hover:underline"
            >
              Programează o nouă vizită
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
