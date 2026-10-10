import { useState, type FormEvent } from 'react'
import { ChevronLeft } from 'lucide-react'
import type { Service } from '../../../data/services'
import { Button } from '../../ui/Button'

type DetailsStepProps = {
  service: Service
  staffLabel: string
  date: string
  time: string
  onBack: () => void
  onSubmit: (data: {
    clientName: string
    clientPhone: string
    clientEmail: string
  }) => void
}

function formatDateRo(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function DetailsStep({
  service,
  staffLabel,
  date,
  time,
  onBack,
  onSubmit,
}: DetailsStepProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setError('Completează numele și numărul de telefon.')
      return
    }
    if (phone.replace(/\D/g, '').length < 9) {
      setError('Introdu un număr de telefon valid.')
      return
    }
    setError('')
    onSubmit({
      clientName: name,
      clientPhone: phone,
      clientEmail: email,
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-text"
      >
        <ChevronLeft size={16} strokeWidth={1.75} aria-hidden />
        Schimbă ora
      </button>

      <header className="mb-6">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-taupe">
          Pasul 4
        </p>
        <h2 className="mt-2 font-display text-2xl text-text sm:text-3xl">
          Detaliile tale
        </h2>
        <p className="mt-2 text-sm text-muted">
          Confirmă programarea — te contactăm dacă e nevoie.
        </p>
      </header>

      <aside className="mb-8 border border-line bg-elevated/50 p-4 sm:p-5">
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-taupe">
          Sumar
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Serviciu</dt>
            <dd className="text-right text-text">{service.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Specialist</dt>
            <dd className="text-right text-text">{staffLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Data</dt>
            <dd className="text-right capitalize text-text">
              {formatDateRo(date)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Ora</dt>
            <dd className="text-right text-text">{time}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Durată / preț</dt>
            <dd className="text-right text-champagne-soft">
              {service.duration}
              {service.price ? ` · ${service.price}` : ''}
            </dd>
          </div>
        </dl>
      </aside>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <label className="block">
          <span className="text-[0.7rem] uppercase tracking-[0.16em] text-taupe">
            Nume *
          </span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full border border-line bg-bg px-4 py-3 text-text outline-none transition-colors placeholder:text-muted/50 focus:border-champagne"
            placeholder="Numele tău"
            required
          />
        </label>

        <label className="block">
          <span className="text-[0.7rem] uppercase tracking-[0.16em] text-taupe">
            Telefon *
          </span>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1.5 w-full border border-line bg-bg px-4 py-3 text-text outline-none transition-colors placeholder:text-muted/50 focus:border-champagne"
            placeholder="07xx xxx xxx"
            required
          />
        </label>

        <label className="block">
          <span className="text-[0.7rem] uppercase tracking-[0.16em] text-taupe">
            Email <span className="normal-case tracking-normal">(opțional)</span>
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full border border-line bg-bg px-4 py-3 text-text outline-none transition-colors placeholder:text-muted/50 focus:border-champagne"
            placeholder="email@exemplu.ro"
          />
        </label>

        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="mt-2 w-full sm:w-auto">
          Confirmă programarea
        </Button>
      </form>
    </div>
  )
}
