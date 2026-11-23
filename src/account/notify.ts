/**
 * Emailuri via EmailJS (plan gratuit) — confirmare programare + OTP reset parolă.
 *
 * Setup: https://www.emailjs.com
 *   VITE_EMAILJS_SERVICE_ID
 *   VITE_EMAILJS_PUBLIC_KEY
 *   VITE_EMAILJS_TEMPLATE_ID          → OTP: {{to_email}} {{user_name}} {{otp_code}} {{salon_name}}
 *   VITE_EMAILJS_BOOKING_TEMPLATE_ID  → booking: {{to_email}} {{client_name}} {{services}}
 *         {{date}} {{time}} {{staff}} {{salon_name}} {{salon_phone}} {{salon_address}}
 */

import { businessInfo } from '../config/business'

export type NotifyResult =
  | { ok: true; delivery: 'emailjs' }
  | { ok: false; delivery: 'local'; reason: string }

function emailJsBase() {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined
  if (!serviceId?.trim() || !publicKey?.trim()) return null
  return { serviceId, publicKey }
}

function otpTemplateId() {
  return (import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined)?.trim()
}

function bookingTemplateId() {
  return (
    import.meta.env.VITE_EMAILJS_BOOKING_TEMPLATE_ID as string | undefined
  )?.trim()
}

export function isEmailJsConfigured(): boolean {
  return Boolean(emailJsBase() && otpTemplateId())
}

export function isBookingEmailConfigured(): boolean {
  return Boolean(emailJsBase() && bookingTemplateId())
}

async function sendEmailJs(
  templateId: string,
  params: Record<string, string>,
): Promise<NotifyResult> {
  const cfg = emailJsBase()
  if (!cfg) {
    return {
      ok: false,
      delivery: 'local',
      reason: 'EmailJS neconfigurat.',
    }
  }

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: cfg.serviceId,
        template_id: templateId,
        user_id: cfg.publicKey,
        template_params: params,
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
      reason: 'Nu s-a putut trimite emailul.',
    }
  }
}

export async function sendOtpEmail(input: {
  toEmail: string
  userName: string
  otpCode: string
}): Promise<NotifyResult> {
  const templateId = otpTemplateId()
  if (!templateId) {
    return {
      ok: false,
      delivery: 'local',
      reason: 'Template OTP EmailJS lipsă.',
    }
  }
  return sendEmailJs(templateId, {
    to_email: input.toEmail,
    user_name: input.userName,
    otp_code: input.otpCode,
    salon_name: businessInfo.name,
  })
}

export async function sendBookingConfirmationEmail(input: {
  toEmail: string
  clientName: string
  services: string
  date: string
  time: string
  staff: string
}): Promise<NotifyResult> {
  const templateId = bookingTemplateId()
  if (!templateId) {
    return {
      ok: false,
      delivery: 'local',
      reason: 'Template confirmare programare EmailJS lipsă.',
    }
  }
  return sendEmailJs(templateId, {
    to_email: input.toEmail,
    client_name: input.clientName,
    services: input.services,
    date: input.date,
    time: input.time,
    staff: input.staff,
    salon_name: businessInfo.name,
    salon_phone: businessInfo.phone,
    salon_address: `${businessInfo.address}, ${businessInfo.city}`,
  })
}
