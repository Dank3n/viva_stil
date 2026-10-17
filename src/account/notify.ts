/**
 * Trimitere OTP pe email — gratuită via EmailJS (static-friendly).
 *
 * Setup (opțional):
 * 1. Cont free pe https://www.emailjs.com
 * 2. Service (Gmail / Outlook) + Template cu variabile:
 *      {{to_email}}, {{user_name}}, {{otp_code}}, {{salon_name}}
 * 3. În .env:
 *      VITE_EMAILJS_SERVICE_ID=...
 *      VITE_EMAILJS_TEMPLATE_ID=...
 *      VITE_EMAILJS_PUBLIC_KEY=...
 *
 * Fără aceste variabile → modul local (cod afișat pe ecran).
 * SMS real nu e gratuit; pentru telefon folosim codul de recuperare.
 */

import { businessInfo } from '../config/business'

export type NotifyResult =
  | { ok: true; delivery: 'emailjs' }
  | { ok: false; delivery: 'local'; reason: string }

function emailJsConfig() {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined
  if (!serviceId || !templateId || !publicKey) return null
  return { serviceId, templateId, publicKey }
}

export function isEmailJsConfigured(): boolean {
  return emailJsConfig() !== null
}

export async function sendOtpEmail(input: {
  toEmail: string
  userName: string
  otpCode: string
}): Promise<NotifyResult> {
  const cfg = emailJsConfig()
  if (!cfg) {
    return {
      ok: false,
      delivery: 'local',
      reason: 'EmailJS neconfigurat — se folosește verificarea locală.',
    }
  }

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: cfg.serviceId,
        template_id: cfg.templateId,
        user_id: cfg.publicKey,
        template_params: {
          to_email: input.toEmail,
          user_name: input.userName,
          otp_code: input.otpCode,
          salon_name: businessInfo.name,
        },
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return {
        ok: false,
        delivery: 'local',
        reason: text || `EmailJS a răspuns ${res.status}`,
      }
    }

    return { ok: true, delivery: 'emailjs' }
  } catch {
    return {
      ok: false,
      delivery: 'local',
      reason: 'Nu s-a putut trimite emailul. Se afișează codul local.',
    }
  }
}
