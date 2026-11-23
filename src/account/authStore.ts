/**
 * Auth: Supabase (cloud) când e configurat, altfel localStorage.
 * Email obligatoriu. Reset parolă: OTP pe email (EmailJS / local).
 */

import {
  cloudCompletePasswordReset,
  cloudFindHint,
  cloudLogin,
  cloudRegister,
  cloudStartPasswordReset,
  isCloudAuthEnabled,
} from './cloudAuth'
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

const USERS_KEY = 'viva-stil-users-v4'
const SESSION_KEY = 'viva-stil-session'

function hashSecret(value: string): string {
  try {
    return btoa(`viva:${value}`)
  } catch {
    return `viva:${value}`
  }
}

function hashPassword(password: string): string {
  return hashSecret(password)
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return '***'
  return `${local[0] ?? '*'}***@${domain}`
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
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
    recoveryCodeHash: u.recoveryCodeHash ?? '',
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
    recoveryCodeHash: '',
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

function setSession(user: PublicUser) {
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ user, at: Date.now() }),
    )
  } catch {
    /* ignore */
  }
}

function persist(list: User[]) {
  usersMemory = list
  saveUsers(list)
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
    const parsed = JSON.parse(raw) as { user?: PublicUser; userId?: string }
    if (parsed.user?.id) return parsed.user
    // compat sesiuni vechi
    if (parsed.userId) {
      const user = users().find((u) => u.id === parsed.userId)
      return user ? toPublic(user) : null
    }
    return null
  } catch {
    return null
  }
}

export async function registerUser(input: {
  name: string
  phone: string
  email: string
  password: string
}): Promise<{ ok: true; user: PublicUser } | { ok: false; error: string }> {
  const name = input.name.trim()
  const phone = normalizePhone(input.phone)
  const email = input.email.trim().toLowerCase()
  const password = input.password

  if (name.length < 2) return { ok: false, error: 'Introdu numele complet.' }
  if (phone.length < 9) return { ok: false, error: 'Număr de telefon invalid.' }
  if (!isValidEmail(email)) return { ok: false, error: 'Email obligatoriu și valid.' }
  if (password.length < 6) {
    return { ok: false, error: 'Parola trebuie să aibă cel puțin 6 caractere.' }
  }

  if (isCloudAuthEnabled()) {
    const result = await cloudRegister({ name, phone, email, password })
    if (!result.ok) return result
    setSession(result.user)
    return { ok: true, user: result.user }
  }

  const all = users()
  if (all.some((u) => phonesMatch(u.phone, phone))) {
    return { ok: false, error: 'Există deja un cont cu acest telefon.' }
  }
  if (all.some((u) => u.email && u.email === email)) {
    return { ok: false, error: 'Există deja un cont cu acest email.' }
  }

  const user: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    phone,
    email,
    passwordHash: hashPassword(password),
    recoveryCodeHash: '',
    createdAt: new Date().toISOString(),
  }
  all.push(user)
  persist(all)
  const pub = toPublic(user)
  setSession(pub)
  return { ok: true, user: pub }
}

export async function loginUser(input: {
  phone: string
  password: string
}): Promise<{ ok: true; user: PublicUser } | { ok: false; error: string }> {
  const login = input.phone.trim()

  if (isCloudAuthEnabled()) {
    const result = await cloudLogin({ login, password: input.password })
    if (!result.ok) return result
    setSession(result.user)
    return { ok: true, user: result.user }
  }

  const phone = normalizePhone(login)
  const email = login.toLowerCase()
  const all = users()
  const user = all.find(
    (u) => phonesMatch(u.phone, phone) || (u.email && u.email === email),
  )
  if (!user || user.passwordHash !== hashPassword(input.password)) {
    return { ok: false, error: 'Telefon/email sau parolă greșită.' }
  }
  const pub = toPublic(user)
  setSession(pub)
  return { ok: true, user: pub }
}

export async function findAccountHint(login: string): Promise<
  | { ok: true; hasEmail: boolean; maskedEmail: string | null }
  | { ok: false; error: string }
> {
  if (isCloudAuthEnabled()) {
    const result = await cloudFindHint(login)
    if (!result.ok) return result
    return {
      ok: true,
      hasEmail: result.hasEmail,
      maskedEmail: result.maskedEmail,
    }
  }

  const phone = normalizePhone(login)
  const email = login.trim().toLowerCase()
  const user = users().find(
    (u) => phonesMatch(u.phone, phone) || (u.email && u.email === email),
  )
  if (!user) return { ok: false, error: 'Nu există cont cu aceste date.' }
  return {
    ok: true,
    hasEmail: Boolean(user.email),
    maskedEmail: user.email ? maskEmail(user.email) : null,
  }
}

export async function startEmailPasswordReset(
  login: string,
): Promise<
  { ok: true; challenge: PasswordResetChallenge } | { ok: false; error: string }
> {
  if (isCloudAuthEnabled()) {
    return cloudStartPasswordReset(login)
  }

  const phone = normalizePhone(login)
  const emailLogin = login.trim().toLowerCase()
  const user = users().find(
    (u) => phonesMatch(u.phone, phone) || (u.email && u.email === emailLogin),
  )
  if (!user) return { ok: false, error: 'Nu există cont cu aceste date.' }
  if (!user.email) {
    return { ok: false, error: 'Contul nu are email. Contactează salonul.' }
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

export async function completeEmailPasswordReset(input: {
  challengeId: string
  otp: string
  newPassword: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.newPassword.length < 6) {
    return { ok: false, error: 'Parola nouă trebuie să aibă cel puțin 6 caractere.' }
  }

  if (isCloudAuthEnabled()) {
    return cloudCompletePasswordReset(input)
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
