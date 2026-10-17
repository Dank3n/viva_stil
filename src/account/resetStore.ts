/**
 * Challenge-uri OTP pentru resetare parolă (sessionStorage).
 */

import type { ResetMethod } from './types'

const KEY = 'viva-stil-password-reset'
const TTL_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5

export type ResetChallenge = {
  id: string
  userId: string
  method: ResetMethod
  codeHash: string
  demoCode: string
  expiresAt: number
  attempts: number
  maskedHint: string
  delivery: 'emailjs' | 'local'
}

function hashCode(code: string): string {
  try {
    return btoa(`reset:${code.trim().toUpperCase()}`)
  } catch {
    return `reset:${code.trim().toUpperCase()}`
  }
}

function load(): ResetChallenge[] {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return []
    const now = Date.now()
    return (JSON.parse(raw) as ResetChallenge[]).filter((c) => c.expiresAt > now)
  } catch {
    return []
  }
}

function save(items: ResetChallenge[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    /* ignore */
  }
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function createResetChallenge(input: {
  userId: string
  method: ResetMethod
  maskedHint: string
  code: string
  delivery: 'emailjs' | 'local'
}): ResetChallenge {
  const challenge: ResetChallenge = {
    id: `reset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: input.userId,
    method: input.method,
    codeHash: hashCode(input.code),
    demoCode: input.code,
    expiresAt: Date.now() + TTL_MS,
    attempts: 0,
    maskedHint: input.maskedHint,
    delivery: input.delivery,
  }

  const all = load().filter((c) => c.userId !== input.userId)
  all.push(challenge)
  save(all)
  return challenge
}

export function verifyResetChallenge(
  challengeId: string,
  code: string,
): { ok: true; userId: string } | { ok: false; error: string } {
  const all = load()
  const idx = all.findIndex((c) => c.id === challengeId)
  if (idx < 0) return { ok: false, error: 'Sesiunea a expirat. Reia resetarea.' }

  const challenge = all[idx]
  if (challenge.expiresAt < Date.now()) {
    all.splice(idx, 1)
    save(all)
    return { ok: false, error: 'Codul a expirat. Cere unul nou.' }
  }

  challenge.attempts += 1
  if (challenge.attempts > MAX_ATTEMPTS) {
    all.splice(idx, 1)
    save(all)
    return { ok: false, error: 'Prea multe încercări. Reia resetarea.' }
  }

  if (challenge.codeHash !== hashCode(code)) {
    save(all)
    return { ok: false, error: 'Cod incorrect.' }
  }

  const { userId } = challenge
  all.splice(idx, 1)
  save(all)
  return { ok: true, userId }
}

export function getResetChallenge(challengeId: string): ResetChallenge | null {
  return load().find((c) => c.id === challengeId) ?? null
}
