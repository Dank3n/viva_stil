import { useState, type FormEvent } from 'react'
import { useAuth } from '../../account/AuthContext'
import type { PasswordResetChallenge, ResetMethod } from '../../account/types'
import { isEmailJsConfigured } from '../../account/notify'
import { Button } from '../ui/Button'

type Mode = 'login' | 'register' | 'forgot'

export function AuthPanel() {
  const {
    login,
    register,
    lookupAccount,
    startEmailReset,
    completeEmailReset,
    resetWithRecovery,
  } = useAuth()

  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [recoveryShown, setRecoveryShown] = useState<string | null>(null)

  // Forgot password
  const [resetMethod, setResetMethod] = useState<ResetMethod>('recovery')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [emailChallenge, setEmailChallenge] =
    useState<PasswordResetChallenge | null>(null)
  const [accountHasEmail, setAccountHasEmail] = useState(false)
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function goMode(next: Mode) {
    setMode(next)
    setError('')
    setInfo('')
    setEmailChallenge(null)
    setResetCode('')
    setNewPassword('')
    setAccountHasEmail(false)
    setMaskedEmail(null)
    setResetMethod('recovery')
  }

  function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError('')
    const result = login(phone, password)
    if (!result.ok) setError(result.error)
  }

  function handleRegister(e: FormEvent) {
    e.preventDefault()
    setError('')
    const result = register({ name, phone, email, password })
    if (!result.ok) {
      setError(result.error)
      return
    }
    setRecoveryShown(result.recoveryCode)
  }

  async function handleLookupForReset(e: FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    const hint = lookupAccount(phone)
    if (!hint.ok) {
      setError(hint.error)
      return
    }
    setAccountHasEmail(hint.hasEmail)
    setMaskedEmail(hint.maskedEmail)
    setInfo(
      hint.hasEmail
        ? `Cont găsit. Poți reseta cu codul de recuperare sau OTP pe ${hint.maskedEmail}.`
        : 'Cont găsit. Folosește codul de recuperare (nu există email pe cont).',
    )
    if (!hint.hasEmail) setResetMethod('recovery')
  }

  async function handleSendEmailOtp() {
    setError('')
    setBusy(true)
    try {
      const result = await startEmailReset(phone)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setEmailChallenge(result.challenge)
      setInfo(
        result.challenge.delivery === 'emailjs'
          ? `Am trimis un cod pe ${result.challenge.maskedHint}.`
          : `Mod local: codul apare mai jos (EmailJS neconfigurat).`,
      )
    } finally {
      setBusy(false)
    }
  }

  function handleCompleteReset(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (resetMethod === 'recovery') {
      const result = resetWithRecovery({
        phone,
        recoveryCode: resetCode,
        newPassword,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setInfo('Parola a fost schimbată. Te poți autentifica.')
      goMode('login')
      setPassword('')
      return
    }

    if (!emailChallenge) {
      setError('Trimite mai întâi codul pe email.')
      return
    }
    const result = completeEmailReset({
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
  }

  if (recoveryShown) {
    return (
      <div className="mx-auto max-w-md border border-line bg-surface p-6 sm:p-8">
        <h2 className="font-display text-2xl text-text">Salvează codul de recuperare</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Contul a fost creat. Acest cod e singura cale gratuită, offline, de a-ți
          reseta parola dacă o uiți. Copiază-l într-un loc sigur — nu îl mai
          afișăm.
        </p>
        <p className="mt-6 break-all rounded-sm border border-champagne/40 bg-champagne/10 px-4 py-4 text-center font-mono text-lg tracking-wide text-champagne-soft">
          {recoveryShown}
        </p>
        <Button
          type="button"
          size="lg"
          className="mt-6 w-full"
          onClick={() => setRecoveryShown(null)}
        >
          Am salvat codul — continuă
        </Button>
      </div>
    )
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
            Verificare gratuită: cod de recuperare (local) sau OTP pe email
            {isEmailJsConfigured()
              ? ' (EmailJS).'
              : ' (local / EmailJS opțional).'}{' '}
            SMS real nu e gratuit — de aceea nu îl folosim.
          </p>

          <form onSubmit={handleLookupForReset} className="space-y-4">
            <label className="block">
              <span className="text-[0.7rem] uppercase tracking-[0.16em] text-taupe">
                Telefonul contului *
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full border border-line bg-bg px-4 py-3 text-text outline-none focus:border-champagne"
                placeholder="07xx xxx xxx"
                required
              />
            </label>
            <Button type="submit" variant="secondary" className="w-full">
              Caută contul
            </Button>
          </form>

          {info || accountHasEmail || maskedEmail !== null ? (
            <form onSubmit={handleCompleteReset} className="mt-6 space-y-4">
              <fieldset>
                <legend className="text-[0.7rem] uppercase tracking-[0.16em] text-taupe">
                  Metodă de verificare
                </legend>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetMethod('recovery')
                      setEmailChallenge(null)
                      setResetCode('')
                    }}
                    className={[
                      'border px-3 py-3 text-left text-sm transition-colors',
                      resetMethod === 'recovery'
                        ? 'border-champagne bg-champagne/10 text-text'
                        : 'border-line text-muted',
                    ].join(' ')}
                  >
                    Cod recuperare
                    <span className="mt-1 block text-xs opacity-70">
                      Offline, gratuit
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={!accountHasEmail}
                    onClick={() => {
                      setResetMethod('email')
                      setResetCode('')
                    }}
                    className={[
                      'border px-3 py-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                      resetMethod === 'email'
                        ? 'border-champagne bg-champagne/10 text-text'
                        : 'border-line text-muted',
                    ].join(' ')}
                  >
                    Cod pe email
                    <span className="mt-1 block text-xs opacity-70">
                      {maskedEmail ?? 'necesită email pe cont'}
                    </span>
                  </button>
                </div>
              </fieldset>

              {resetMethod === 'email' ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  disabled={busy}
                  onClick={handleSendEmailOtp}
                >
                  {busy ? 'Se trimite…' : 'Trimite codul pe email'}
                </Button>
              ) : null}

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
                  {resetMethod === 'recovery'
                    ? 'Cod de recuperare *'
                    : 'Cod OTP din email *'}
                </span>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="mt-1.5 w-full border border-line bg-bg px-4 py-3 font-mono text-text outline-none focus:border-champagne"
                  placeholder={
                    resetMethod === 'recovery' ? 'XXXX-XXXX-XXXX' : '6 cifre'
                  }
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

              <Button type="submit" size="lg" className="w-full">
                Salvează parola nouă
              </Button>
            </form>
          ) : null}
        </>
      ) : (
        <>
          <p className="mb-6 text-sm leading-relaxed text-muted">
            {mode === 'login'
              ? 'Intră în cont ca să vezi programările și să lași recenzii.'
              : 'Creează un cont cu telefonul folosit la programări. Vei primi un cod de recuperare — salvează-l.'}
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
                Telefon *
              </span>
              <input
                type="tel"
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
                  Email (recomandat pentru resetare)
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full border border-line bg-bg px-4 py-3 text-text outline-none focus:border-champagne"
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

            <Button type="submit" size="lg" className="w-full">
              {mode === 'login' ? 'Intră în cont' : 'Creează cont'}
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
          <p className="font-medium text-text">Cont demo</p>
          <p className="mt-1">
            Telefon <span className="text-champagne-soft">0723 111 222</span>
            {' · '}
            parolă <span className="text-champagne-soft">demo123</span>
          </p>
          <p className="mt-2">
            Cod recuperare demo:{' '}
            <span className="font-mono text-champagne-soft">VIVA-DEMO-RECOVERY</span>
          </p>
        </aside>
      ) : null}
    </div>
  )
}
