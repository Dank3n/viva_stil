import { Outlet } from 'react-router-dom'
import { AuthProvider } from '../../account/AuthContext'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { ImageLightboxProvider } from '../ui/ImageLightbox'
import { MobileStickyCta } from '../ui/MobileStickyCta'

export function Layout() {
  return (
    <AuthProvider>
      <ImageLightboxProvider>
        <div className="min-h-dvh bg-bg">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-champagne focus:px-4 focus:py-2 focus:text-bg"
          >
            Sari la conținut
          </a>
          <Navbar />
          <main id="main" className="pb-24 lg:pb-0">
            <Outlet />
          </main>
          <Footer />
          <MobileStickyCta />
        </div>
      </ImageLightboxProvider>
    </AuthProvider>
  )
}
