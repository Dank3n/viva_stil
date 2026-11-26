/**
 * Emailuri de pe site — fără backend.
 *
 * Programări: FormSubmit → viva_stil@yahoo.com + CC pe emailul clientului.
 *   (prima folosire: confirmă linkul FormSubmit din inbox Yahoo)
 *
 * OTP reset parolă: FormSubmit către emailul clientului (sau EmailJS dacă e în .env).
 */

import { businessInfo } from '../config/business'

export type NotifyResult =
  | { ok: true; delivery: 'formsubmit' | 'emailjs' }
  | { ok: false; delivery: 'local'; reason: string }

function env(name: string): string | undefined {
  const value = (import.meta.env[name] as string | undefined)?.trim()
  return value || undefined
}

function salonInbox(): string {
  return (
    env('VITE_BOOKING_INBOX_EMAIL') ||
    businessInfo.email ||
    'viva_stil@yahoo.com'
  )
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

/** Confirmările de programare merg prin FormSubmit — mereu „configurate”. */
export function isBookingEmailConfigured(): boolean {
  return Boolean(salonInbox())
}

export function getBookingEmailSetupHint(): string | null {
  return null
}

type FormSubmitPayload = {
  to: string
  subject: string
  replyTo: string
  name: string
  fields: Record<string, string>
  cc?: string
}

function buildFormSubmitFields(input: FormSubmitPayload): Record<string, string> {
  const body: Record<string, string> = {
    name: input.name,
    email: input.replyTo,
    _replyto: input.replyTo,
    _subject: input.subject,
    _template: 'table',
    _captcha: 'false',
    ...input.fields,
  }
  if (input.cc?.trim()) body._cc = input.cc.trim()
  return body
}

/** Fallback non-AJAX — FormSubmit acceptă POST clasic din browser. */
function sendFormSubmitViaForm(input: FormSubmitPayload): Promise<NotifyResult> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve({
        ok: false,
        delivery: 'local',
        reason: 'Trimite din browser, nu din server.',
      })
      return
    }

    const fields = buildFormSubmitFields(input)
    const iframeName = `viva-fs-${Date.now()}`
    const iframe = document.createElement('iframe')
    iframe.name = iframeName
    iframe.title = 'email-delivery'
    iframe.setAttribute('aria-hidden', 'true')
    iframe.style.cssText = 'display:none;width:0;height:0;border:0'
    document.body.appendChild(iframe)

    const form = document.createElement('form')
    form.method = 'POST'
    form.action = `https://formsubmit.co/${encodeURIComponent(input.to)}`
    form.target = iframeName
    form.style.display = 'none'

    for (const [key, value] of Object.entries(fields)) {
      const inputEl = document.createElement('input')
      inputEl.type = 'hidden'
      inputEl.name = key
      inputEl.value = value
      form.appendChild(inputEl)
    }

    document.body.appendChild(form)
    form.submit()

    window.setTimeout(() => {
      form.remove()
      iframe.remove()
      console.info('[Viva Stil] Email trimis via FormSubmit (form POST).')
      resolve({ ok: true, delivery: 'formsubmit' })
    }, 1800)
  })
}

async function sendFormSubmit(input: FormSubmitPayload): Promise<NotifyResult> {
  const fields = buildFormSubmitFields(input)

  try {
    const res = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(input.to)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(fields),
      },
    )

    const text = await res.text().catch(() => '')
    let parsed: { success?: string | boolean; message?: string } = {}
    try {
      parsed = JSON.parse(text) as {
        success?: string | boolean
        message?: string
      }
    } catch {
      /* plain text OK */
    }

    const successFlag = parsed.success
    const failedFlag = successFlag === false || successFlag === 'false'
    const message = String(parsed.message || text || '')

    if (!res.ok || failedFlag) {
      // AJAX eșuat → încearcă POST clasic (merge pe site live / localhost)
      if (
        message.toLowerCase().includes('web server') ||
        message.toLowerCase().includes('html files') ||
        !res.ok
      ) {
        console.warn('[Viva Stil] FormSubmit AJAX eșuat, fallback form:', message)
        return sendFormSubmitViaForm(input)
      }
      console.error('[Viva Stil] FormSubmit error:', message)
      return {
        ok: false,
        delivery: 'local',
        reason: message || `FormSubmit a răspuns ${res.status}`,
      }
    }

    console.info('[Viva Stil] Email trimis via FormSubmit.', parsed)
    return { ok: true, delivery: 'formsubmit' }
  } catch (err) {
    console.warn('[Viva Stil] FormSubmit fetch eșuat, fallback form:', err)
    return sendFormSubmitViaForm(input)
  }
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
      return {
        ok: false,
        delivery: 'local',
        reason: text || `EmailJS ${res.status}`,
      }
    }
    return { ok: true, delivery: 'emailjs' }
  } catch (err) {
    return {
      ok: false,
      delivery: 'local',
      reason: err instanceof Error ? err.message : 'EmailJS eșuat.',
    }
  }
}

export async function sendOtpEmail(input: {
  toEmail: string
  userName: string
  otpCode: string
}): Promise<NotifyResult> {
  if (isEmailJsConfigured()) {
    const templateId = otpTemplateId()!
    return sendEmailJs(templateId, {
      to_email: input.toEmail,
      email: input.toEmail,
      user_name: input.userName,
      client_name: input.userName,
      otp_code: input.otpCode,
      salon_name: businessInfo.name,
    })
  }

  // OTP pe emailul clientului (FormSubmit)
  return sendFormSubmit({
    to: input.toEmail,
    subject: `Cod resetare parolă — ${businessInfo.name}`,
    replyTo: salonInbox(),
    name: input.userName,
    fields: {
      mesaj: `Salut ${input.userName},\n\nCodul tău pentru resetarea parolei la ${businessInfo.name} este: ${input.otpCode}\n\nExpiră în 10 minute.\n\nDacă nu ai cerut tu resetarea, ignoră acest mesaj.`,
      cod_otp: input.otpCode,
    },
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
  const salon = salonInbox()
  const clientEmail = input.toEmail.trim().toLowerCase()

  const summary = [
    `Client: ${input.clientName}`,
    `Email client: ${clientEmail}`,
    `Servicii: ${input.services}`,
    `Data: ${input.date}`,
    `Ora: ${input.time}`,
    `Specialist: ${input.staff}`,
    `Salon: ${businessInfo.name}`,
    `Adresă: ${businessInfo.address}, ${businessInfo.city}`,
    `Telefon salon: ${businessInfo.phone}`,
  ].join('\n')

  const clientMessage = [
    `Salut ${input.clientName},`,
    '',
    `Programarea ta la ${businessInfo.name} este confirmată.`,
    '',
    `Servicii: ${input.services}`,
    `Data: ${input.date}`,
    `Ora: ${input.time}`,
    `Specialist: ${input.staff}`,
    '',
    `Adresă: ${businessInfo.address}, ${businessInfo.city}`,
    `Telefon: ${businessInfo.phone}`,
    '',
    'Te așteptăm!',
  ].join('\n')

  // 1) Prefer EmailJS dacă e configurat (To = client)
  if (emailJsBase() && bookingTemplateId()) {
    const result = await sendEmailJs(bookingTemplateId()!, {
      to_email: clientEmail,
      email: clientEmail,
      client_name: input.clientName,
      user_name: input.clientName,
      services: input.services,
      date: input.date,
      time: input.time,
      staff: input.staff,
      salon_name: businessInfo.name,
      salon_phone: businessInfo.phone,
      salon_address: `${businessInfo.address}, ${businessInfo.city}`,
      message: clientMessage,
      subject: `Confirmare programare — ${businessInfo.name}`,
    })
    if (result.ok) return result
    console.warn('[Viva Stil] EmailJS booking failed, fallback FormSubmit:', result)
  }

  // 2) FormSubmit: notificare pe viva_stil@yahoo.com + CC pe emailul clientului
  const toSalon = await sendFormSubmit({
    to: salon,
    subject: `Programare nouă — ${input.clientName} · ${input.date} ${input.time}`,
    replyTo: clientEmail,
    name: input.clientName,
    cc: clientEmail,
    fields: {
      servicii: input.services,
      data: input.date,
      ora: input.time,
      specialist: input.staff,
      mesaj: summary,
      confirmare_pentru_client: clientMessage,
    },
  })

  // 3) Confirmare dedicată și pe inbox-ul clientului
  const toClient = await sendFormSubmit({
    to: clientEmail,
    subject: `Confirmare programare — ${businessInfo.name}`,
    replyTo: salon,
    name: businessInfo.name,
    fields: {
      mesaj: clientMessage,
      servicii: input.services,
      data: input.date,
      ora: input.time,
      specialist: input.staff,
      salon: businessInfo.name,
      telefon_salon: businessInfo.phone,
    },
  })

  if (toSalon.ok || toClient.ok) {
    return { ok: true, delivery: 'formsubmit' }
  }

  return {
    ok: false,
    delivery: 'local',
    reason:
      toSalon.reason ||
      toClient.reason ||
      'Nu s-a putut trimite emailul de confirmare.',
  }
}
