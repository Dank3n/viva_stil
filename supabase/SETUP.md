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

## 2. Email la programare (FormSubmit — fără cont plătit)

Implicit, confirmările merg prin [FormSubmit](https://formsubmit.co) către
`viva_stil@yahoo.com`, cu **CC** pe emailul clientului din formular.

**O singură dată:** la prima programare (sau activare), FormSubmit trimite pe
Yahoo un mail „Confirm your email” — deschide-l și apasă linkul. După asta,
confirmările pleacă automat.

Opțional în `.env`: `VITE_BOOKING_INBOX_EMAIL=viva_stil@yahoo.com`

EmailJS rămâne opțional (OTP / alternativă).

## Fluxuri pe site

| Acțiune | Ce se întâmplă |
|--------|----------------|
| Programare | Email obligatoriu → salvare (local + Supabase) → email confirmare |
| Cont nou | Email + telefon + parolă → rând în `clients` |
| Login | Telefon sau email + parolă (același cont) |
| Ai uitat parola | Cod pe email → parolă nouă pe același cont |
