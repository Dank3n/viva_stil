import type { ServiceCategory } from './services'
import { services } from './services'

export type Specialist = {
  id: string
  name: string
  role: string
  rating?: string
  reviews?: string
  /** Categorii pe care le acoperă (filtrează la pasul specialist). */
  categoryIds: ServiceCategory[]
}

const hairCategories: ServiceCategory[] = [
  'Spălat',
  'Tratament',
  'Colorare',
  'Permanent',
  'Coafuri din perie',
  'Coafuri din perie + placă / ondulator',
  'Coafuri extensii',
  'Coafuri speciale',
]

/**
 * Echipa salonului.
 * DB: staff + staff_services / categoryIds
 */
export const specialists: Specialist[] = [
  {
    id: 'george',
    name: 'George',
    role: 'Hair-stylist',
    categoryIds: hairCategories,
  },
  {
    id: 'cristina',
    name: 'Cristina',
    role: 'Hair-stylist',
    categoryIds: hairCategories,
  },
  {
    id: 'andrei',
    name: 'Andrei',
    role: 'Hair-stylist',
    categoryIds: hairCategories,
  },
  {
    id: 'larisa-radu',
    name: 'Larisa Radu',
    role: 'Tehnician unghii',
    rating: '5.00',
    reviews: '43 evaluări',
    categoryIds: ['Manichiură - Pedichiură'],
  },
  {
    id: 'paula-toader',
    name: 'Paula Toader',
    role: 'Tehnician unghii',
    rating: '5.00',
    reviews: '22 evaluări',
    categoryIds: ['Manichiură - Pedichiură'],
  },
]

export function specialistsForService(serviceId: string): Specialist[] {
  return specialistsForServices([serviceId])
}

/** Specialiști care pot acoperi TOATE serviciile selectate. */
export function specialistsForServices(serviceIds: string[]): Specialist[] {
  if (!serviceIds.length) return []
  const selected = serviceIds
    .map((id) => services.find((s) => s.id === id))
    .filter(Boolean) as Array<{ category: string }>
  if (selected.length !== serviceIds.length) return []

  return specialists.filter((s) =>
    selected.every((svc) =>
      s.categoryIds.includes(svc.category as ServiceCategory),
    ),
  )
}

export function getSpecialistById(id: string): Specialist | undefined {
  return specialists.find((s) => s.id === id)
}
