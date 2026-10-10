import { mapsUrl } from './gallery'

/**
 * Date publice din profilul Google Maps — Viva Stil.
 * Actualizează rating/count când se schimbă pe Maps.
 */
export const googleReviews = {
  rating: 4.5,
  count: 211,
  mapsUrl,
  /** Deschide dialogul „Write a review” pe Google (necesită cont Google). */
  writeReviewUrl:
    'https://www.google.com/search?q=Viva+Stil+Octavian+Goga&ludocid=15923227233632245560#lrd=0x40b1ff1fbd0fe4d9:0xdcfaaacdda79d738,3,,,',
} as const
