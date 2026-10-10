export type Testimonial = {
  id: string
  name: string
  text: string
  rating: number
}

/**
 * Înlocuiește aceste placeholder-uri cu recenzii reale ale clientelor.
 * Nu afișa rating-uri sau citate inventate ca fiind autentice.
 */
export const testimonials: Testimonial[] = [
  {
    id: 'placeholder-1',
    name: 'Nume clientă',
    text: 'Adaugă aici o recenzie reală. Până atunci, această secțiune este pregătită pentru feedback-ul clientelor tale.',
    rating: 5,
  },
  {
    id: 'placeholder-2',
    name: 'Nume clientă',
    text: 'Spațiu rezervat pentru o a doua recenzie. Poți copia citate din Google sau Instagram.',
    rating: 5,
  },
  {
    id: 'placeholder-3',
    name: 'Nume clientă',
    text: 'A treia recenzie placeholder — înlocuiește textul și numele pentru a finaliza carouselul.',
    rating: 5,
  },
]
