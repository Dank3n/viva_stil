/**
 * Auth pe Supabase (bază de date gratuită) când VITE_SUPABASE_* e setat.
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase'
import { isEmailJsConfigured, sendOtpEmail } from './notify'
import type { PasswordResetChallenge, PublicUser } from './types'

type RpcOkUser = { ok: true; user: PublicUser }
type RpcFail = { ok: false; error: string }

function mapUser(raw: Record<string, unknown>): PublicUser {
  return {
    id: String(raw.id),
    name: String(raw.name),
    phone: String(raw.phone),
    email: String(raw.email ?? ''),
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
  }
}

export { isSupabaseConfigured as isCloudAuthEnabled }

export async function cloudRegister(input: {
  name: string
  phone: string
  email: string
  password: string
}): Promise<RpcOkUser | RpcFail> {
  const sb = getSupabase()
  if (!sb) return { ok: false, error: 'Baza de date nu e configurată.' }

  const { data, error } = await sb.rpc('register_client', {
    p_name: input.name,
    p_phone: input.phone,
    p_email: input.email,
    p_password: input.password,
  })

  if (error) return { ok: false, error: error.message }
  const result = data as { ok: boolean; error?: string; user?: Record<string, unknown> }
  if (!result?.ok || !result.user) {
    return { ok: false, error: result?.error ?? 'Înregistrare eșuată.' }
  }
  return { ok: true, user: mapUser(result.user) }
}

export async function cloudLogin(input: {
  login: string
  password: string
}): Promise<RpcOkUser | RpcFail> {
  const sb = getSupabase()
  if (!sb) return { ok: false, error: 'Baza de date nu e configurată.' }

  const { data, error } = await sb.rpc('login_client', {
    p_login: input.login,
    p_password: input.password,
  })

  if (error) return { ok: false, error: error.message }
  const result = data as { ok: boolean; error?: string; user?: Record<string, unknown> }
  if (!result?.ok || !result.user) {
    return { ok: false, error: result?.error ?? 'Autentificare eșuată.' }
  }
  return { ok: true, user: mapUser(result.user) }
}

export async function cloudFindHint(
  login: string,
): Promise<
  | { ok: true; hasEmail: boolean; maskedEmail: string | null; email: string }
  | RpcFail
> {
  const sb = getSupabase()
  if (!sb) return { ok: false, error: 'Baza de date nu e configurată.' }

  const { data, error } = await sb.rpc('find_client_hint', { p_login: login })
  if (error) return { ok: false, error: error.message }
  const result = data as {
    ok: boolean
    error?: string
    hasEmail?: boolean
    maskedEmail?: string
    email?: string
  }
  if (!result?.ok) {
    return { ok: false, error: result?.error ?? 'Cont negăsit.' }
  }
  return {
    ok: true,
    hasEmail: Boolean(result.hasEmail),
    maskedEmail: result.maskedEmail ?? null,
    email: result.email ?? '',
  }
}

export async function cloudStartPasswordReset(
  login: string,
): Promise<{ ok: true; challenge: PasswordResetChallenge } | RpcFail> {
  const sb = getSupabase()
  if (!sb) return { ok: false, error: 'Baza de date nu e configurată.' }

  const { data, error } = await sb.rpc('start_password_reset', {
    p_login: login,
  })
  if (error) return { ok: false, error: error.message }

  const result = data as {
    ok: boolean
    error?: string
    challengeId?: string
    otp?: string
    maskedEmail?: string
    email?: string
    userName?: string
  }
  if (!result?.ok || !result.challengeId || !result.otp || !result.email) {
    return { ok: false, error: result?.error ?? 'Nu s-a putut porni resetarea.' }
  }

  let delivery: 'emailjs' | 'local' = 'local'
  if (isEmailJsConfigured()) {
    const sent = await sendOtpEmail({
      toEmail: result.email,
      userName: result.userName ?? 'Client',
      otpCode: result.otp,
    })
    delivery = sent.ok ? 'emailjs' : 'local'
  }

  return {
    ok: true,
    challenge: {
      challengeId: result.challengeId,
      method: 'email',
      maskedHint: result.maskedEmail ?? '***',
      delivery,
      demoCode: delivery === 'local' ? result.otp : undefined,
    },
  }
}

export async function cloudCompletePasswordReset(input: {
  challengeId: string
  otp: string
  newPassword: string
}): Promise<{ ok: true } | RpcFail> {
  const sb = getSupabase()
  if (!sb) return { ok: false, error: 'Baza de date nu e configurată.' }

  const { data, error } = await sb.rpc('complete_password_reset', {
    p_challenge_id: input.challengeId,
    p_otp: input.otp,
    p_new_password: input.newPassword,
  })
  if (error) return { ok: false, error: error.message }
  const result = data as { ok: boolean; error?: string }
  if (!result?.ok) {
    return { ok: false, error: result?.error ?? 'Resetare eșuată.' }
  }
  return { ok: true }
}
