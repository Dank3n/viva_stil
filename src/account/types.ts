/**
 * Cont client + recenzii — pregătit pentru API / DB.
 *
 * users
 *   id, name, phone (unique), email?, passwordHash,
 *   recoveryCodeHash, createdAt
 *
 * Verificare gratuită / locală:
 *   1. Cod de recuperare (afișat o singură dată la înregistrare) — 100% offline
 *   2. OTP pe email via EmailJS (plan gratuit) — opțional, vezi .env.example
 *   3. OTP local/demo când EmailJS nu e configurat (cod afișat pe ecran)
 *
 * SMS real necesită provider plătit; pe site folosim email + cod recuperare.
 */

export type User = {
  id: string
  name: string
  phone: string
  email: string
  /** Mock — în producție: hash bcrypt pe server */
  passwordHash: string
  /** Hash al codului de recuperare (afișat o singură dată la signup) */
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

export type ResetMethod = 'recovery' | 'email'

export type PasswordResetChallenge = {
  challengeId: string
  method: ResetMethod
  maskedHint: string
  /** Doar când EmailJS lipsește / eșuează — pentru test local */
  demoCode?: string
  delivery: 'emailjs' | 'local'
}
