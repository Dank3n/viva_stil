import { useState, type FormEvent } from 'react'
import { createReview } from '../../account/reviewStore'
import type { AspectRatings } from '../../account/types'
import { Button } from '../ui/Button'
import { StarRating } from './StarRating'

type ReviewFormProps = {
  appointmentId: string
  userId: string
  clientName: string
  onSaved: () => void
  onCancel: () => void
}

const emptyAspects: AspectRatings = {
  service: 5,
  specialist: 5,
  atmosphere: 5,
}

export function ReviewForm({
  appointmentId,
  userId,
  clientName,
  onSaved,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [aspects, setAspects] = useState<AspectRatings>(emptyAspects)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const result = createReview(
      { appointmentId, rating, title, body, aspects },
      { userId, clientName },
    )
    if (!result.ok) {
      setError(result.error)
      return
    }
    onSaved()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-4 border border-champagne/40 bg-champagne/5 p-4 sm:p-5"
      noValidate
    >
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-taupe">
        Lasă o recenzie
      </p>

      <StarRating label="Rating general" value={rating} onChange={setRating} size={26} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StarRating
          label="Serviciu"
          value={aspects.service}
          onChange={(v) => setAspects((a) => ({ ...a, service: v }))}
          size={18}
        />
        <StarRating
          label="Specialist"
          value={aspects.specialist}
          onChange={(v) => setAspects((a) => ({ ...a, specialist: v }))}
          size={18}
        />
        <StarRating
          label="Atmosferă"
          value={aspects.atmosphere}
          onChange={(v) => setAspects((a) => ({ ...a, atmosphere: v }))}
          size={18}
        />
      </div>

      <label className="block">
        <span className="text-[0.7rem] uppercase tracking-[0.16em] text-taupe">
          Titlu
        </span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1.5 w-full border border-line bg-bg px-4 py-3 text-text outline-none focus:border-champagne"
          placeholder="Ex. Experiență excelentă"
        />
      </label>

      <label className="block">
        <span className="text-[0.7rem] uppercase tracking-[0.16em] text-taupe">
          Review detaliat *
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className="mt-1.5 w-full resize-y border border-line bg-bg px-4 py-3 text-text outline-none focus:border-champagne"
          placeholder="Spune-ne cum a fost vizita, ce ți-a plăcut, ce putem îmbunătăți…"
          required
        />
      </label>

      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="md">
          Publică recenzia
        </Button>
        <Button type="button" variant="secondary" size="md" onClick={onCancel}>
          Anulează
        </Button>
      </div>
    </form>
  )
}
