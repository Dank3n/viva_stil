import { useState, type FormEvent } from 'react'
import { useAuth } from '../../account/AuthContext'
import type { PasswordResetChallenge } from '../../account/types'
import { isEmailJsConfigured } from '../../account/notify'
import { isSupabaseConfigured } from '../../lib/supabase'
import { Button } from '../ui/Button'

type Mode = 'login' | 'register' | 'forgot'

export function AuthPanel() {
  const {
    login,
    register,
    lookupAccount,
    startEmailReset,
    completeEmailReset,
  } = useAuth()

  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  const [resetLogin, setResetLogin] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [emailChallenge, setEmailChallenge] =
    useState<PasswordResetChallenge | null>(null)
  const [accountFound, setAccountFound] = useState(false)
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null)

  function goMode(next: Mode) {
    setMode(next)
    setError('')
    setInfo('')
    setEmailChallenge(null)
    setResetCode('')
    setNewPassword('')
    setAccountFound(false)
    setMaskedEmail(null)
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const result = await login(phone, password)
      if (!result.ok) setError(result.error)
    } finally {
      setBusy(false)
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const result = await register({ name, phone, email, password })
      if (!result.ok) setError(result.error)
    } finally {
      setBusy(false)
    }
  }

  async function handleLookupForReset(e: FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      const hint = await lookupAccount(resetLogin || phone)
      if (!hint.ok) {
        setError(hint.error)
        setAccountFound(false)
        return
      }
      setAccountFound(true)
      setMaskedEmail(hint.maskedEmail)
      setInfo(
        hint.maskedEmail
          ? `Cont găsit. Îți trimitem un cod pe ${hint.maskedEmail}.`
          : 'Cont găsit. Trimite codul pe email.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleSendEmailOtp() {
    setError('')
    setBusy(true)
    try {
      const result = await startEmailReset(resetLogin || phone)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setEmailChallenge(result.challenge)
      setInfo(
        result.challenge.delivery === 'emailjs'
          ? `Am trimis un cod pe ${result.challenge.maskedHint}.`
          : 'Mod local: codul apare mai jos (configurează EmailJS pentru email real).',
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleCompleteReset(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!emailChallenge) {
      setError('Trimite mai întâi codul pe email.')
      return
    }
    setBusy(true)
    try {
      const result = await completeEmailReset({
        challengeId: emailChallenge.challengeId,
        otp: resetCode,
        newPassword,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setInfo('Parola a fost schimbată. Te poți autentifica.')
      goMode('login')
      setPassword('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md border border-line bg-surface p-6 sm:p-8">
      {mode !== 'forgot' ? (
        <div className="mb-6 flex gap-2 border-b border-line pb-1">
          <button
            type="button"
            onClick={() => goMode('login')}
            className={[
              'flex-1 pb-3 text-sm font-medium uppercase tracking-[0.14em] transition-colors',
              mode === 'login'
                ? 'border-b-2 border-champagne text-text'
                : 'text-muted hover:text-text',
            ].join(' ')}
          >
            Autentificare
          </button>
          <button
            type="button"
            onClick={() => goMode('register')}
            className={[
              'flex-1 pb-3 text-sm font-medium uppercase tracking-[0.14em] transition-colors',
              mode === 'register'
                ? 'border-b-2 border-champagne text-text'
                : 'text-muted hover:text-text',
            ].join(' ')}
          >
            Cont nou
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => goMode('login')}
          className="mb-4 text-sm text-muted transition-colors hover:text-text"
        >
          ← Înapoi la autentificare
        </button>
      )}

      {mode === 'forgot' ? (
        <>
          <h2 className="font-display text-2xl text-text">Resetare parolă</h2>
          <p className="mt-2 mb-6 text-sm leading-relaxed text-muted">
            Introdu telefonul sau emailul contului. Îți trimitem un cod pe
            email
            {isEmailJsConfigured() ? '' : ' (local până configurezi EmailJS)'}
            , apoi setezi o parolă nouă pe același cont.
          </p>

          <form onSubmit={handleLookupForReset} className="space-y-4">
            <label className="block">
              <span className="text-[0.7rem] uppercase tracking-[0.16em] text-taupe">
                Telefon sau email *
              </span>
              <input
                type="text"
                value={resetLogin}
                onChange={(e) => setResetLogin(e.target.value)}
                className="mt-1.5 w-full border border-line bg-bg px-4 py-3 text-text outline-none focus:border-champagne"
                placeholder="07xx… sau email@exemplu.ro"
                required
              />
            </label>
            <Button
              type="submit"
              variant="secondary"
              className="w-full"
              disabled={busy}
            >
              Caută contul
            </Button>
          </form>

          {accountFound ? (
            <form onSubmit={handleCompleteReset} className="mt-6 space-y-4">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                disabled={busy}
                onClick={handleSendEmailOtp}
              >
                {busy && !emailChallenge
                  ? 'Se trimite…'
                  : `Trimite codul pe ${maskedEmail ?? 'email'}`}
              </Button>

              {emailChallenge?.demoCode ? (
                <aside className="border border-line bg-elevated/40 p-3 text-xs text-muted">
                  Mod local — cod OTP:{' '}
                  <span className="font-mono text-base text-champagne-soft">
                    {emailChallenge.demoCode}
                  </span>
                </aside>
              ) : null}

              <label className="block">
                <span className="text-[0.7rem] uppercase tracking-[0.16em] text-taupe">
                  Cod din email *
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="mt-1.5 w-full border border-line bg-bg px-4 py-3 font-mono text-text outline-none focus:border-champagne"
                  placeholder="6 cifre"
                  required
                />
              </label>

              <label className="block">
                <span className="text-[0.7rem] uppercase tracking-[0.16em] text-taupe">
                  Parolă nouă *
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1.5 w-full border border-line bg-bg px-4 py-3 text-text outline-none focus:border-champagne"
                  required
                />
              </label>

              {error ? (
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              ) : null}
              {info ? <p className="text-sm text-muted">{info}</p> : null}

              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                Salvează parola nouă
              </Button>
            </form>
          ) : null}

          {error && !accountFound ? (
            <p className="mt-4 text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          {info && !accountFound ? (
            <p className="mt-4 text-sm text-muted">{info}</p>
          ) : null}
        </>
      ) : (
        <>
          <p className="mb-6 text-sm leading-relaxed text-muted">
            {mode === 'login'
              ? 'Intră în cont ca să vezi programările pe orice dispozitiv și să lași recenzii.'
              : 'Creează un cont o singură dată — emailul e obligatoriu pentru confirmări și resetare parolă.'}
          </p>

          <form
            onSubmit={mode === 'login' ? handleLogin : handleRegister}
            className="space-y-4"
            noValidate
          >
            {mode === 'register' ? (
              <label className="block">
                <span className="text-[0.7rem] uppercase tracking-[0.16em] text-taupe">
                  Nume *
                </span>
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full border border-line bg-bg px-4 py-3 text-text outline-none focus:border-champagne"
                  required
                />
              </label>
            ) : null}

            <label className="block">
              <span className="text-[0.7rem] uppercase tracking-[0.16em] text-taupe">
                {mode === 'login' ? 'Telefon sau email *' : 'Telefon *'}
              </span>
              <input
                type={mode === 'login' ? 'text' : 'tel'}
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full border border-line bg-bg px-4 py-3 text-text outline-none focus:border-champagne"
                placeholder="07xx xxx xxx"
                required
              />
            </label>

            {mode === 'register' ? (
              <label className="block">
                <span className="text-[0.7rem] uppercase tracking-[0.16em] text-taupe">
                  Email *
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full border border-line bg-bg px-4 py-3 text-text outline-none focus:border-champagne"
                  placeholder="email@exemplu.ro"
                  required
                />
              </label>
            ) : null}

            <label className="block">
              <span className="text-[0.7rem] uppercase tracking-[0.16em] text-taupe">
                Parolă *
              </span>
              <input
                type="password"
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full border border-line bg-bg px-4 py-3 text-text outline-none focus:border-champagne"
                required
              />
            </label>

            {error ? (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            ) : null}
            {info ? <p className="text-sm text-muted">{info}</p> : null}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy
                ? 'Se procesează…'
                : mode === 'login'
                  ? 'Intră în cont'
                  : 'Creează cont'}
            </Button>
          </form>

          {mode === 'login' ? (
            <button
              type="button"
              onClick={() => goMode('forgot')}
              className="mt-4 w-full text-center text-sm text-champagne-soft underline-offset-2 hover:underline"
            >
              Ai uitat parola?
            </button>
          ) : null}
        </>
      )}

      {mode === 'login' ? (
        <aside className="mt-6 border border-line bg-elevated/40 p-4 text-xs leading-relaxed text-muted">
          <p className="font-medium text-text">
            {isSupabaseConfigured()
              ? 'Conturile se salvează în baza de date (Supabase).'
              : 'Mod local — configurează Supabase pentru conturi pe toate dispozitivele.'}
          </p>
          {!isSupabaseConfigured() ? (
            <p className="mt-2">
              Demo local: telefon{' '}
              <span className="text-champagne-soft">0723 111 222</span>
              {' · '}
              parolă <span className="text-champagne-soft">demo123</span>
            </p>
          ) : null}
        </aside>
      ) : null}
    </div>
  )
}
