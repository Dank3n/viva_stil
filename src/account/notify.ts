/**
 * Emailuri via EmailJS (plan gratuit).
 *
 * Obligatoriu în `.env` (apoi restart `npm run dev` / rebuild deploy):
 *   VITE_EMAILJS_SERVICE_ID
 *   VITE_EMAILJS_PUBLIC_KEY
 *   VITE_EMAILJS_TEMPLATE_ID              (OTP reset — și fallback booking)
 *   VITE_EMAILJS_BOOKING_TEMPLATE_ID      (confirmare programare; recomandat)
 *
 * În template-ul EmailJS, câmpul "To Email" trebuie să fie: {{to_email}}
 * (sau {{email}} — trimitem ambele).
 */

import { businessInfo } from '../config/business'

export type NotifyResult =
  | { ok: true; delivery: 'emailjs' }
  | { ok: false; delivery: 'local'; reason: string }

function env(name: string): string | undefined {
  const value = (import.meta.env[name] as string | undefined)?.trim()
  return value || undefined
}

function emailJsBase() {
  const serviceId = env('VITE_EMAILJS_SERVICE_ID')
  const publicKey = env('VITE_EMAILJS_PUBLIC_KEY')
  if (!serviceId || !publicKey) return null
  return {
    serviceId,
    publicKey,
    privateKey: env('VITE_EMAILJS_PRIVATE_KEY'),
  }
}

function otpTemplateId() {
  return env('VITE_EMAILJS_TEMPLATE_ID')
}

function bookingTemplateId() {
  return env('VITE_EMAILJS_BOOKING_TEMPLATE_ID') || otpTemplateId()
}

export function isEmailJsConfigured(): boolean {
  return Boolean(emailJsBase() && otpTemplateId())
}

export function isBookingEmailConfigured(): boolean {
  return Boolean(emailJsBase() && bookingTemplateId())
}

export function getBookingEmailSetupHint(): string | null {
  if (isBookingEmailConfigured()) return null
  const missing: string[] = []
  if (!env('VITE_EMAILJS_SERVICE_ID')) missing.push('VITE_EMAILJS_SERVICE_ID')
  if (!env('VITE_EMAILJS_PUBLIC_KEY')) missing.push('VITE_EMAILJS_PUBLIC_KEY')
  if (!bookingTemplateId()) {
    missing.push('VITE_EMAILJS_BOOKING_TEMPLATE_ID (sau VITE_EMAILJS_TEMPLATE_ID)')
  }
  return `Email neconfigurat. Lipsește în .env: ${missing.join(', ')}. Vezi supabase/SETUP.md.`
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
      reason: getBookingEmailSetupHint() ?? 'EmailJS neconfigurat.',
    }
  }

  const body: Record<string, unknown> = {
    service_id: cfg.serviceId,
    template_id: templateId,
    user_id: cfg.publicKey,
    template_params: params,
  }
  if (cfg.privateKey) body.accessToken = cfg.privateKey

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const text = await res.text().catch(() => '')

    if (!res.ok) {
      const reason =
        text ||
        `EmailJS a răspuns ${res.status}. Verifică service/template/keys și că To Email = {{to_email}}.`
      console.error('[Viva Stil] EmailJS error:', reason)
      return { ok: false, delivery: 'local', reason }
    }

    console.info('[Viva Stil] Email trimis via EmailJS.')
    return { ok: true, delivery: 'emailjs' }
  } catch (err) {
    const reason =
      err instanceof Error ? err.message : 'Nu s-a putut trimite emailul.'
    console.error('[Viva Stil] EmailJS network error:', reason)
    return { ok: false, delivery: 'local', reason }
  }
}

/** Destinatar: EmailJS cere {{to_email}} sau {{email}} în câmpul To. */
function recipientParams(toEmail: string): Record<string, string> {
  return {
    to_email: toEmail,
    email: toEmail,
    reply_to: toEmail,
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
      reason: 'Lipsește VITE_EMAILJS_TEMPLATE_ID în .env.',
    }
  }
  return sendEmailJs(templateId, {
    ...recipientParams(input.toEmail),
    user_name: input.userName,
    client_name: input.userName,
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
  const setupHint = getBookingEmailSetupHint()
  if (setupHint) {
    console.warn('[Viva Stil]', setupHint)
    return { ok: false, delivery: 'local', reason: setupHint }
  }

  const templateId = bookingTemplateId()!
  const usingOtpFallback =
    !env('VITE_EMAILJS_BOOKING_TEMPLATE_ID') && Boolean(otpTemplateId())

  const summary = [
    `Servicii: ${input.services}`,
    `Data: ${input.date}`,
    `Ora: ${input.time}`,
    `Specialist: ${input.staff}`,
    `Salon: ${businessInfo.name}`,
    `Adresă: ${businessInfo.address}, ${businessInfo.city}`,
    `Telefon salon: ${businessInfo.phone}`,
  ].join('\n')

  const result = await sendEmailJs(templateId, {
    ...recipientParams(input.toEmail),
    client_name: input.clientName,
    user_name: input.clientName,
    services: input.services,
    date: input.date,
    time: input.time,
    staff: input.staff,
    salon_name: businessInfo.name,
    salon_phone: businessInfo.phone,
    salon_address: `${businessInfo.address}, ${businessInfo.city}`,
    // fallback pe template OTP: corpul „codului” = sumarul programării
    otp_code: usingOtpFallback ? summary : input.time,
    message: summary,
    subject: `Confirmare programare — ${businessInfo.name}`,
  })

  if (!result.ok && usingOtpFallback) {
    return {
      ...result,
      reason: `${result.reason} (folosit template OTP ca fallback — creează un template separat de confirmare).`,
    }
  }

  return result
}
