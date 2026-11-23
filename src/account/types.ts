/**
 * Cont client + recenzii.
 *
 * Persistență: Supabase (VITE_SUPABASE_*) sau localStorage fallback.
 * Email obligatoriu. Reset parolă: OTP pe email (EmailJS).
 */

export type User = {
  id: string
  name: string
  phone: string
  email: string
  /** Mock local — pe cloud: bcrypt în PostgreSQL */
  passwordHash: string
  recoveryCodeHash: string
  createdAt: string
}

export type PublicUser = Omit<User, 'passwordHash' | 'recoveryCodeHash'>

export type AspectRatings = {
  service: number
  specialist: number
  atmosphere: number
}

export type Review = {
  id: string
  appointmentId: string
  userId: string
  clientName: string
  rating: number
  title: string
  body: string
  aspects: AspectRatings
  createdAt: string
}

export type ReviewDraft = {
  appointmentId: string
  rating: number
  title: string
  body: string
  aspects: AspectRatings
}

export type ResetMethod = 'email'

export type PasswordResetChallenge = {
  challengeId: string
  method: ResetMethod
  maskedHint: string
  /** Doar când EmailJS lipsește — pentru test local */
  demoCode?: string
  delivery: 'emailjs' | 'local'
}
