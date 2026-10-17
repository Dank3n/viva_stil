/**
 * Recenzii mock (localStorage).
 * În producție: GET/POST /api/reviews
 */

import type { Review, ReviewDraft } from './types'

const STORAGE_KEY = 'viva-stil-reviews'

function load(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Review[]
  } catch {
    return []
  }
}

function save(items: Review[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* ignore */
  }
}

let memory: Review[] | null = null

export function listReviews(): Review[] {
  if (typeof window === 'undefined') return []
  if (!memory) memory = load()
  return memory
}

export function getReviewForAppointment(appointmentId: string): Review | undefined {
  return listReviews().find((r) => r.appointmentId === appointmentId)
}

export function getReviewsByUser(userId: string): Review[] {
  return listReviews().filter((r) => r.userId === userId)
}

export function createReview(
  draft: ReviewDraft,
  meta: { userId: string; clientName: string },
): { ok: true; review: Review } | { ok: false; error: string } {
  if (draft.rating < 1 || draft.rating > 5) {
    return { ok: false, error: 'Alege un rating de la 1 la 5 stele.' }
  }
  if (draft.body.trim().length < 10) {
    return { ok: false, error: 'Scrie un review de cel puțin 10 caractere.' }
  }
  if (getReviewForAppointment(draft.appointmentId)) {
    return { ok: false, error: 'Ai lăsat deja o recenzie pentru această vizită.' }
  }

  const aspects = {
    service: clampStar(draft.aspects.service || draft.rating),
    specialist: clampStar(draft.aspects.specialist || draft.rating),
    atmosphere: clampStar(draft.aspects.atmosphere || draft.rating),
  }

  const review: Review = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    appointmentId: draft.appointmentId,
    userId: meta.userId,
    clientName: meta.clientName,
    rating: clampStar(draft.rating),
    title: draft.title.trim(),
    body: draft.body.trim(),
    aspects,
    createdAt: new Date().toISOString(),
  }

  const all = listReviews()
  all.unshift(review)
  memory = all
  save(all)
  return { ok: true, review }
}

function clampStar(n: number): number {
  return Math.min(5, Math.max(1, Math.round(n)))
}
