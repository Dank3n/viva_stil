# Setup bază de date + email (gratuit)

## 1. Supabase (conturi + programări)

1. Cont pe [supabase.com](https://supabase.com) → **New project**
2. **SQL Editor** → lipește tot din `schema.sql` → **Run**
3. **Settings → API** → copiază:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`
4. Creează `.env` în rădăcina proiectului (vezi `.env.example`)
5. Restart `npm run dev`

Fără aceste variabile, site-ul folosește localStorage (doar pe același browser).

## 2. EmailJS (confirmare programare + cod reset parolă)

1. Cont pe [emailjs.com](https://www.emailjs.com) (plan free)
2. Adaugă un **Email Service** (Gmail / Outlook)
3. Creează **2 template-uri**:

### OTP reset parolă
Variabile: `{{to_email}}`, `{{user_name}}`, `{{otp_code}}`, `{{salon_name}}`

Exemplu body:
```
Salut {{user_name}},

Codul tău pentru resetarea parolei la {{salon_name}} este: {{otp_code}}

Expiră în 10 minute.
```

### Confirmare programare
Variabile: `{{to_email}}`, `{{client_name}}`, `{{services}}`, `{{date}}`, `{{time}}`, `{{staff}}`, `{{salon_name}}`, `{{salon_phone}}`, `{{salon_address}}`

Exemplu body:
```
Salut {{client_name}},

Programarea ta la {{salon_name}} este confirmată.

Servicii: {{services}}
Data: {{date}}
Ora: {{time}}
Specialist: {{staff}}

Adresă: {{salon_address}}
Telefon: {{salon_phone}}
```

4. Completează în `.env`:
   - `VITE_EMAILJS_SERVICE_ID`
   - `VITE_EMAILJS_PUBLIC_KEY`
   - `VITE_EMAILJS_TEMPLATE_ID` (OTP)
   - `VITE_EMAILJS_BOOKING_TEMPLATE_ID` (confirmare)

În template EmailJS, setează **To Email** = `{{to_email}}`.

## Fluxuri pe site

| Acțiune | Ce se întâmplă |
|--------|----------------|
| Programare | Email obligatoriu → salvare (local + Supabase) → email confirmare |
| Cont nou | Email + telefon + parolă → rând în `clients` |
| Login | Telefon sau email + parolă (același cont) |
| Ai uitat parola | Cod pe email → parolă nouă pe același cont |
