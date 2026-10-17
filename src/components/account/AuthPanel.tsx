import { useState, type FormEvent } from 'react'
import { useAuth } from '../../account/AuthContext'
import type { RegisterStartResult, VerifyChannel } from '../../account/types'
import { Button } from '../ui/Button'

type Mode = 'login' | 'register'

export function AuthPanel() {
  const { login, startRegister, verifyRegister, resendRegisterCode } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [channel, setChannel] = useState<VerifyChannel>('sms')
  const [error, setError] = useState('')
  const [challenge, setChallenge] = useState<RegisterStartResult | null>(null)
  const [otp, setOtp] = useState('')
  const [info, setInfo] = useState('')

  function resetForms() {
    setError('')
    setInfo('')
    setChallenge(null)
    setOtp('')
  }

  function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError('')
    const result = login(phone, password)
    if (!result.ok) setError(result.error)
  }

  function handleStartRegister(e: FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    const result = startRegister({ name, phone, email, password, channel })
    if (!result.ok) {
      setError(result.error)
      return
    }
    setChallenge(result.result)
    setOtp('')
    setInfo(
      result.result.channel === 'sms'
        ? `Am trimis un cod SMS la ${result.result.maskedDestination}.`
        : `Am trimis un cod pe email la ${result.result.maskedDestination}.`,
    )
  }

  function handleVerify(e: FormEvent) {
    e.preventDefault()
    if (!challenge) return
    setError('')
    const result = verifyRegister(challenge.challengeId, otp)
    if (!result.ok) setError(result.error)
  }

  function handleResend() {
    if (!challenge) return
    setError('')
    const result = resendRegisterCode(challenge.challengeId)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setChallenge(result.result)
    setInfo('Am trimis un cod nou.')
  }

  return (
    <div className="mx-auto max-w-md border border-line bg-surface p-6 sm:p-8">
      {!challenge ? (
        <>
          <div className="mb-6 flex gap-2 border-b border-line pb-1">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                resetForms()
              }}
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
              onClick={() => {
                setMode('register')
                resetForms()
              }}
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

          <p className="mb-6 text-sm leading-relaxed text-muted">
            {mode === 'login'
              ? 'Intră în cont ca să vezi programările și să lași recenzii.'
              : 'Creează un cont și verifică-l prin SMS sau email.'}
          </p>

          <form
            onSubmit={mode === 'login' ? handleLogin : handleStartRegister}
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
              <>
                <label className="block">
                  <span className="text-[0.7rem] uppercase tracking-[0.16em] text-taupe">
                    Email{channel === 'email' ? ' *' : ''}
                  </span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 w-full border border-line bg-bg px-4 py-3 text-text outline-none focus:border-champagne"
                    required={channel === 'email'}
                  />
                </label>

                <fieldset>
                  <legend className="text-[0.7rem] uppercase tracking-[0.16em] text-taupe">
                    Verificare prin *
                  </legend>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setChannel('sms')}
                      className={[
                        'border px-3 py-3 text-sm transition-colors',
                        channel === 'sms'
                          ? 'border-champagne bg-champagne/10 text-text'
                          : 'border-line text-muted hover:border-champagne/40',
                      ].join(' ')}
                    >
                      SMS
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel('email')}
                      className={[
                        'border px-3 py-3 text-sm transition-colors',
                        channel === 'email'
                          ? 'border-champagne bg-champagne/10 text-text'
                          : 'border-line text-muted hover:border-champagne/40',
                      ].join(' ')}
                    >
                      Email
                    </button>
                  </div>
                </fieldset>
              </>
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

            <Button type="submit" size="lg" className="w-full">
              {mode === 'login' ? 'Intră în cont' : 'Trimite codul'}
            </Button>
          </form>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={resetForms}
            className="mb-4 text-sm text-muted transition-colors hover:text-text"
          >
            ← Înapoi la formular
          </button>
          <h2 className="font-display text-2xl text-text">Verifică contul</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {info ||
              (challenge.channel === 'sms'
                ? `Introdu codul primit prin SMS la ${challenge.maskedDestination}.`
                : `Introdu codul primit pe email la ${challenge.maskedDestination}.`)}
          </p>

          <form onSubmit={handleVerify} className="mt-6 space-y-4" noValidate>
            <label className="block">
              <span className="text-[0.7rem] uppercase tracking-[0.16em] text-taupe">
                Cod din 6 cifre *
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                className="mt-1.5 w-full border border-line bg-bg px-4 py-3 text-center font-display text-2xl tracking-[0.35em] text-text outline-none focus:border-champagne"
                placeholder="••••••"
                required
              />
            </label>

            {error ? (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full">
              Confirmă și creează contul
            </Button>
          </form>

          <button
            type="button"
            onClick={handleResend}
            className="mt-4 w-full text-center text-sm text-champagne-soft underline-offset-2 hover:underline"
          >
            Retrimite codul
          </button>

          <aside className="mt-6 border border-line bg-elevated/40 p-4 text-xs leading-relaxed text-muted">
            <p className="font-medium text-text">Mod demo (fără SMS/email real)</p>
            <p className="mt-1">
              Codul tău de verificare:{' '}
              <span className="font-mono text-base text-champagne-soft">
                {challenge.demoCode}
              </span>
            </p>
            <p className="mt-2">
              În producție, codul se trimite doar pe{' '}
              {challenge.channel === 'sms' ? 'SMS' : 'email'}.
            </p>
          </aside>
        </>
      )}

      {!challenge ? (
        <aside className="mt-6 border border-line bg-elevated/40 p-4 text-xs leading-relaxed text-muted">
          <p className="font-medium text-text">Cont demo (deja verificat)</p>
          <p className="mt-1">
            Telefon <span className="text-champagne-soft">0723 111 222</span>
            {' · '}
            parolă <span className="text-champagne-soft">demo123</span>
          </p>
        </aside>
      ) : null}
    </div>
  )
}
