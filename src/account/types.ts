/**
 * Cont client + recenzii — pregătit pentru API / DB.
 *
 * users
 *   id, name, phone (unique), email?, passwordHash,
 *   phoneVerified, emailVerified, createdAt
 *
 * verification_challenges (OTP)
 *   id, channel: 'sms' | 'email', destination, codeHash,
 *   expiresAt, attempts, pendingUserPayload
 *
 * În producție:
 *   POST /api/auth/register/start   → trimite SMS (Twilio) sau email (Resend/SendGrid)
 *   POST /api/auth/register/verify  → validează OTP, creează user
 *   POST /api/auth/register/resend
 */

export type VerifyChannel = 'sms' | 'email'

export type User = {
  id: string
  name: string
  phone: string
  email: string
  /** Mock — în producție: hash bcrypt pe server */
  passwordHash: string
  phoneVerified: boolean
  emailVerified: boolean
  createdAt: string
}

export type PublicUser = Omit<User, 'passwordHash'>

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
  /** 1–5 overall */
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

export type RegisterStartResult = {
  challengeId: string
  channel: VerifyChannel
  /** Destinație mascată, ex. 07***222 sau a***@exemplu.ro */
  maskedDestination: string
  expiresInSec: number
  /**
   * Doar în mock/local — în producție codul NU se returnează clientului.
   * Aici e afișat ca să poți testa fără SMS/email real.
   */
  demoCode: string
}
