/**
 * Auth mock (localStorage) + OTP la înregistrare.
 * Înlocuiește cu API real când ai backend.
 */

import {
  createOtpChallenge,
  getOtpTtlSec,
  maskDestination,
  resendOtpChallenge,
  verifyOtpChallenge,
} from './otp'
import type {
  PublicUser,
  RegisterStartResult,
  User,
  VerifyChannel,
} from './types'
import { normalizePhone, phonesMatch } from './phone'

const USERS_KEY = 'viva-stil-users-v2'
const SESSION_KEY = 'viva-stil-session'

function hashPassword(password: string): string {
  try {
    return btoa(`viva:${password}`)
  } catch {
    return `viva:${password}`
  }
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

function normalizeUser(u: User): User {
  return {
    ...u,
    phoneVerified: u.phoneVerified ?? true,
    emailVerified: u.emailVerified ?? Boolean(u.email),
  }
}

function saveUsers(users: User[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
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
    phoneVerified: true,
    emailVerified: true,
    createdAt: new Date().toISOString(),
  }
  saveUsers([demo])
  return [demo]
}

function toPublic(user: User): PublicUser {
  const { passwordHash: _, ...rest } = user
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

/** Pornește înregistrarea: validează datele și trimite OTP (SMS sau email). */
export function startRegistration(input: {
  name: string
  phone: string
  email: string
  password: string
  channel: VerifyChannel
}): { ok: true; result: RegisterStartResult } | { ok: false; error: string } {
  const name = input.name.trim()
  const phone = normalizePhone(input.phone)
  const email = input.email.trim().toLowerCase()
  const password = input.password

  if (name.length < 2) return { ok: false, error: 'Introdu numele complet.' }
  if (phone.length < 9) return { ok: false, error: 'Număr de telefon invalid.' }
  if (password.length < 6)
    return { ok: false, error: 'Parola trebuie să aibă cel puțin 6 caractere.' }

  if (input.channel === 'email') {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: 'Introdu un email valid pentru verificare.' }
    }
  }

  const all = users()
  if (all.some((u) => phonesMatch(u.phone, phone))) {
    return { ok: false, error: 'Există deja un cont cu acest telefon.' }
  }
  if (email && all.some((u) => u.email && u.email === email)) {
    return { ok: false, error: 'Există deja un cont cu acest email.' }
  }

  const destination = input.channel === 'sms' ? phone : email
  const challenge = createOtpChallenge({
    channel: input.channel,
    destination,
    payload: {
      name,
      phone,
      email,
      passwordHash: hashPassword(password),
    },
  })

  return {
    ok: true,
    result: {
      challengeId: challenge.id,
      channel: challenge.channel,
      maskedDestination: maskDestination(challenge.channel, destination),
      expiresInSec: getOtpTtlSec(),
      demoCode: challenge.demoCode,
    },
  }
}

export function resendRegistrationCode(
  challengeId: string,
): { ok: true; result: RegisterStartResult } | { ok: false; error: string } {
  const result = resendOtpChallenge(challengeId)
  if (!result.ok) return result
  const { challenge } = result
  return {
    ok: true,
    result: {
      challengeId: challenge.id,
      channel: challenge.channel,
      maskedDestination: maskDestination(
        challenge.channel,
        challenge.destination,
      ),
      expiresInSec: getOtpTtlSec(),
      demoCode: challenge.demoCode,
    },
  }
}

/** Confirmă OTP-ul și creează contul. */
export function verifyRegistration(
  challengeId: string,
  code: string,
): { ok: true; user: PublicUser } | { ok: false; error: string } {
  const result = verifyOtpChallenge(challengeId, code)
  if (!result.ok) return result

  const { payload, channel } = result
  const all = users()

  if (all.some((u) => phonesMatch(u.phone, payload.phone))) {
    return { ok: false, error: 'Există deja un cont cu acest telefon.' }
  }

  const user: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    passwordHash: payload.passwordHash,
    phoneVerified: channel === 'sms',
    emailVerified: channel === 'email' || Boolean(payload.email),
    createdAt: new Date().toISOString(),
  }

  // Dacă a verificat SMS dar are și email, emailul rămâne neverificat până la un flow separat
  if (channel === 'sms') user.emailVerified = false
  if (channel === 'email') user.phoneVerified = false

  all.push(user)
  usersMemory = all
  saveUsers(all)
  setSession(user.id)
  return { ok: true, user: toPublic(user) }
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
  if (!user.phoneVerified && !user.emailVerified) {
    return {
      ok: false,
      error: 'Cont neverificat. Creează din nou contul și confirmă codul.',
    }
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
