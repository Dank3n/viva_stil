/**
 * Auth mock (localStorage) + reset parolă.
 * Verificare: cod recuperare (local) sau OTP email (EmailJS / local).
 */

import { isEmailJsConfigured, sendOtpEmail } from './notify'
import { normalizePhone, phonesMatch } from './phone'
import {
  createResetChallenge,
  generateOtp,
  getResetChallenge,
  verifyResetChallenge,
} from './resetStore'
import type {
  PasswordResetChallenge,
  PublicUser,
  ResetMethod,
  User,
} from './types'

const USERS_KEY = 'viva-stil-users-v3'
const SESSION_KEY = 'viva-stil-session'

function hashSecret(value: string): string {
  try {
    return btoa(`viva:${value}`)
  } catch {
    return `viva:${value}`
  }
}

function hashRecoveryCode(code: string): string {
  return hashSecret(code.trim().toUpperCase())
}

function hashPassword(password: string): string {
  return hashSecret(password)
}

export function generateRecoveryCode(): string {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${part()}-${part()}-${part()}`
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return '***'
  return `${local[0] ?? '*'}***@${domain}`
}

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return seedUsers()
    return (JSON.parse(raw) as User[]).map(normalizeUser)
  } catch {
    return seedUsers()
  }
}

function normalizeUser(u: User & Record<string, unknown>): User {
  return {
    id: u.id,
    name: u.name,
    phone: u.phone,
    email: u.email ?? '',
    passwordHash: u.passwordHash,
    recoveryCodeHash:
      typeof u.recoveryCodeHash === 'string' && u.recoveryCodeHash
        ? u.recoveryCodeHash
        : hashRecoveryCode('VIVA-DEMO-RECOVERY'),
    createdAt: u.createdAt,
  }
}

function saveUsers(list: User[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

function seedUsers(): User[] {
  const demo: User = {
    id: 'user-demo',
    name: 'Ana Popescu',
    phone: normalizePhone('0723 111 222'),
    email: 'ana@exemplu.ro',
    passwordHash: hashPassword('demo123'),
    recoveryCodeHash: hashRecoveryCode('VIVA-DEMO-RECOVERY'),
    createdAt: new Date().toISOString(),
  }
  saveUsers([demo])
  return [demo]
}

function toPublic(user: User): PublicUser {
  const { passwordHash: _p, recoveryCodeHash: _r, ...rest } = user
  return rest
}

let usersMemory: User[] | null = null

function users(): User[] {
  if (typeof window === 'undefined') return []
  if (!usersMemory) usersMemory = loadUsers()
  return usersMemory
}

function setSession(userId: string) {
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ userId, at: Date.now() }),
    )
  } catch {
    /* ignore */
  }
}

function persist(list: User[]) {
  usersMemory = list
  saveUsers(list)
}

export function registerUser(input: {
  name: string
  phone: string
  email: string
  password: string
}):
  | { ok: true; user: PublicUser; recoveryCode: string }
  | { ok: false; error: string } {
  const name = input.name.trim()
  const phone = normalizePhone(input.phone)
  const email = input.email.trim().toLowerCase()
  const password = input.password

  if (name.length < 2) return { ok: false, error: 'Introdu numele complet.' }
  if (phone.length < 9) return { ok: false, error: 'Număr de telefon invalid.' }
  if (password.length < 6)
    return { ok: false, error: 'Parola trebuie să aibă cel puțin 6 caractere.' }

  const all = users()
  if (all.some((u) => phonesMatch(u.phone, phone))) {
    return { ok: false, error: 'Există deja un cont cu acest telefon.' }
  }
  if (email && all.some((u) => u.email && u.email === email)) {
    return { ok: false, error: 'Există deja un cont cu acest email.' }
  }

  const recoveryCode = generateRecoveryCode()
  const user: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    phone,
    email,
    passwordHash: hashPassword(password),
    recoveryCodeHash: hashRecoveryCode(recoveryCode),
    createdAt: new Date().toISOString(),
  }

  all.push(user)
  persist(all)
  setSession(user.id)
  return { ok: true, user: toPublic(user), recoveryCode }
}

export function loginUser(input: {
  phone: string
  password: string
}): { ok: true; user: PublicUser } | { ok: false; error: string } {
  const phone = normalizePhone(input.phone)
  const all = users()
  const user = all.find((u) => phonesMatch(u.phone, phone))
  if (!user || user.passwordHash !== hashPassword(input.password)) {
    return { ok: false, error: 'Telefon sau parolă greșită.' }
  }
  setSession(user.id)
  return { ok: true, user: toPublic(user) }
}

export function logoutUser() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

export function getSessionUser(): PublicUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const { userId } = JSON.parse(raw) as { userId: string }
    const user = users().find((u) => u.id === userId)
    return user ? toPublic(user) : null
  } catch {
    return null
  }
}

export function findAccountHint(phone: string):
  | { ok: true; hasEmail: boolean; maskedEmail: string | null }
  | { ok: false; error: string } {
  const normalized = normalizePhone(phone)
  const user = users().find((u) => phonesMatch(u.phone, normalized))
  if (!user) return { ok: false, error: 'Nu există cont cu acest telefon.' }
  return {
    ok: true,
    hasEmail: Boolean(user.email),
    maskedEmail: user.email ? maskEmail(user.email) : null,
  }
}

/** Reset cu codul de recuperare (100% local, fără email/SMS). */
export function resetPasswordWithRecovery(input: {
  phone: string
  recoveryCode: string
  newPassword: string
}): { ok: true } | { ok: false; error: string } {
  if (input.newPassword.length < 6) {
    return { ok: false, error: 'Parola nouă trebuie să aibă cel puțin 6 caractere.' }
  }
  const phone = normalizePhone(input.phone)
  const all = users()
  const user = all.find((u) => phonesMatch(u.phone, phone))
  if (!user) return { ok: false, error: 'Nu există cont cu acest telefon.' }
  if (user.recoveryCodeHash !== hashRecoveryCode(input.recoveryCode)) {
    return { ok: false, error: 'Cod de recuperare incorrect.' }
  }
  user.passwordHash = hashPassword(input.newPassword)
  persist(all)
  return { ok: true }
}

/** Pornește resetarea pe email: OTP via EmailJS (gratis) sau local. */
export async function startEmailPasswordReset(phone: string): Promise<
  { ok: true; challenge: PasswordResetChallenge } | { ok: false; error: string }
> {
  const normalized = normalizePhone(phone)
  const user = users().find((u) => phonesMatch(u.phone, normalized))
  if (!user) return { ok: false, error: 'Nu există cont cu acest telefon.' }
  if (!user.email) {
    return {
      ok: false,
      error:
        'Contul nu are email. Folosește codul de recuperare salvat la înregistrare.',
    }
  }

  const otp = generateOtp()
  let delivery: 'emailjs' | 'local' = 'local'
  if (isEmailJsConfigured()) {
    const sent = await sendOtpEmail({
      toEmail: user.email,
      userName: user.name,
      otpCode: otp,
    })
    delivery = sent.ok ? 'emailjs' : 'local'
  }

  const challenge = createResetChallenge({
    userId: user.id,
    method: 'email',
    maskedHint: maskEmail(user.email),
    code: otp,
    delivery,
  })

  console.info(`[Viva Stil] Reset OTP pentru ${user.email}: ${otp}`)

  return {
    ok: true,
    challenge: {
      challengeId: challenge.id,
      method: 'email',
      maskedHint: maskEmail(user.email),
      delivery,
      demoCode: delivery === 'local' ? otp : undefined,
    },
  }
}

export function completeEmailPasswordReset(input: {
  challengeId: string
  otp: string
  newPassword: string
}): { ok: true } | { ok: false; error: string } {
  if (input.newPassword.length < 6) {
    return { ok: false, error: 'Parola nouă trebuie să aibă cel puțin 6 caractere.' }
  }
  const verified = verifyResetChallenge(input.challengeId, input.otp)
  if (!verified.ok) return verified

  const all = users()
  const user = all.find((u) => u.id === verified.userId)
  if (!user) return { ok: false, error: 'Cont inexistent.' }
  user.passwordHash = hashPassword(input.newPassword)
  persist(all)
  return { ok: true }
}

export function getEmailResetChallenge(
  challengeId: string,
): ReturnType<typeof getResetChallenge> {
  return getResetChallenge(challengeId)
}

export type { ResetMethod }
