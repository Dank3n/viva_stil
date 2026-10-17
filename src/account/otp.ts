import type { VerifyChannel } from './types'

const OTP_KEY = 'viva-stil-otp-challenges'
const OTP_TTL_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5

export type PendingRegistration = {
  name: string
  phone: string
  email: string
  passwordHash: string
}

export type OtpChallenge = {
  id: string
  channel: VerifyChannel
  destination: string
  codeHash: string
  /** Vizibil doar în mock — șters după verificare */
  demoCode: string
  expiresAt: number
  attempts: number
  payload: PendingRegistration
}

function hashCode(code: string): string {
  try {
    return btoa(`otp:${code}`)
  } catch {
    return `otp:${code}`
  }
}

function load(): OtpChallenge[] {
  try {
    const raw = sessionStorage.getItem(OTP_KEY)
    if (!raw) return []
    const all = JSON.parse(raw) as OtpChallenge[]
    const now = Date.now()
    return all.filter((c) => c.expiresAt > now)
  } catch {
    return []
  }
}

function save(items: OtpChallenge[]) {
  try {
    sessionStorage.setItem(OTP_KEY, JSON.stringify(items))
  } catch {
    /* ignore */
  }
}

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function maskDestination(channel: VerifyChannel, destination: string): string {
  if (channel === 'sms') {
    const d = destination.replace(/\D/g, '')
    if (d.length < 6) return '***'
    return `${d.slice(0, 2)}***${d.slice(-3)}`
  }
  const [local, domain] = destination.split('@')
  if (!domain) return '***'
  const head = local.slice(0, 1) || '*'
  return `${head}***@${domain}`
}

/**
 * Simulează trimiterea OTP.
 * Producție: apelează Twilio (SMS) / Resend|SendGrid (email).
 */
export function deliverOtp(
  channel: VerifyChannel,
  destination: string,
  code: string,
): void {
  // Mock: log în consolă pentru debug
  console.info(
    `[Viva Stil OTP] ${channel.toUpperCase()} → ${destination}: ${code}`,
  )
  void code
  void destination
  void channel
}

export function createOtpChallenge(input: {
  channel: VerifyChannel
  destination: string
  payload: PendingRegistration
}): OtpChallenge {
  const code = generateOtpCode()
  const challenge: OtpChallenge = {
    id: `otp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    channel: input.channel,
    destination: input.destination,
    codeHash: hashCode(code),
    demoCode: code,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    payload: input.payload,
  }

  const all = load().filter((c) => c.id !== challenge.id)
  // Un singur challenge activ per destinație
  const filtered = all.filter(
    (c) =>
      !(
        c.channel === challenge.channel &&
        c.destination === challenge.destination
      ),
  )
  filtered.push(challenge)
  save(filtered)

  deliverOtp(challenge.channel, challenge.destination, code)
  return challenge
}

export function resendOtpChallenge(
  challengeId: string,
):
  | { ok: true; challenge: OtpChallenge }
  | { ok: false; error: string } {
  const all = load()
  const existing = all.find((c) => c.id === challengeId)
  if (!existing) return { ok: false, error: 'Sesiunea a expirat. Reia înregistrarea.' }
  if (existing.expiresAt < Date.now()) {
    return { ok: false, error: 'Codul a expirat. Reia înregistrarea.' }
  }

  const code = generateOtpCode()
  existing.codeHash = hashCode(code)
  existing.demoCode = code
  existing.expiresAt = Date.now() + OTP_TTL_MS
  existing.attempts = 0
  save(all)
  deliverOtp(existing.channel, existing.destination, code)
  return { ok: true, challenge: existing }
}

export function verifyOtpChallenge(
  challengeId: string,
  code: string,
):
  | { ok: true; payload: PendingRegistration; channel: VerifyChannel }
  | { ok: false; error: string } {
  const all = load()
  const idx = all.findIndex((c) => c.id === challengeId)
  if (idx < 0) return { ok: false, error: 'Sesiunea a expirat. Reia înregistrarea.' }

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
    return { ok: false, error: 'Prea multe încercări. Reia înregistrarea.' }
  }

  const cleaned = code.replace(/\s/g, '')
  if (challenge.codeHash !== hashCode(cleaned)) {
    save(all)
    return { ok: false, error: 'Cod incorrect. Încearcă din nou.' }
  }

  const { payload, channel } = challenge
  all.splice(idx, 1)
  save(all)
  return { ok: true, payload, channel }
}

export function getOtpTtlSec(): number {
  return Math.floor(OTP_TTL_MS / 1000)
}
