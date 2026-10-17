export type GalleryImage = {
  id: string
  src: string
  alt: string
  span?: 'tall' | 'wide' | 'default'
}

export type GalleryVideo = {
  id: string
  src: string
  poster: string
  alt: string
}

/**
 * Media din Google Maps (Viva Stil) + Instagram (@vivastil.22).
 * Fără assets Brizo — toate fișierele din /public/gallery și /public/videos
 * sunt exportate din aceste surse.
 */
export const galleryImages: GalleryImage[] = [
  { id: 'g1', src: '/gallery/01.jpg', alt: 'Fațadă Viva Stil — Bd. Octavian Goga 22', span: 'wide' },
  { id: 'g2', src: '/gallery/02.jpg', alt: 'Produse Kevin Murphy la Viva Stil', span: 'tall' },
  { id: 'g3', src: '/gallery/03.jpg', alt: 'Look final — colorare Viva Stil', span: 'default' },
  { id: 'g4', src: '/gallery/04.jpg', alt: 'Exterior Viva Stil seara', span: 'default' },
  { id: 'g5', src: '/gallery/05.jpg', alt: 'Coafură blondă — Viva Stil', span: 'default' },
  { id: 'g6', src: '/gallery/06.jpg', alt: 'Detaliu din salon Viva Stil', span: 'tall' },
  { id: 'g7', src: '/gallery/07.jpg', alt: 'Spațiu de lucru Viva Stil', span: 'default' },
  { id: 'g8', src: '/gallery/08.jpg', alt: 'Atmosferă salon Viva Stil', span: 'wide' },
  { id: 'g9', src: '/gallery/09.jpg', alt: 'Moment din studio Viva Stil', span: 'default' },
  { id: 'g10', src: '/gallery/10.jpg', alt: 'Interior Viva Stil', span: 'default' },
  { id: 'g11', src: '/gallery/11.jpg', alt: 'Lucrare Viva Stil', span: 'default' },
  { id: 'g12', src: '/gallery/12.jpg', alt: 'Semn Viva Stil pe stradă', span: 'tall' },
  { id: 'g13', src: '/gallery/13.jpg', alt: 'Viva Stil pe Instagram', span: 'default' },
  { id: 'g14', src: '/gallery/14.jpg', alt: 'Post Instagram — Viva Stil', span: 'default' },
  { id: 'g15', src: '/gallery/15.jpg', alt: 'Galerie Instagram Viva Stil', span: 'default' },
  { id: 'g16', src: '/gallery/16.jpg', alt: 'Look Instagram Viva Stil', span: 'wide' },
  { id: 'g17', src: '/gallery/17.jpg', alt: 'Manichiură Viva Stil', span: 'default' },
  { id: 'g18', src: '/gallery/18.jpg', alt: 'Detaliu beauty Viva Stil', span: 'default' },
  { id: 'g19', src: '/gallery/19.jpg', alt: 'Lucrare Instagram Viva Stil', span: 'tall' },
  { id: 'g20', src: '/gallery/20.jpg', alt: 'Stil Viva Stil', span: 'default' },
]

/** Reels Instagram (@vivastil.22) — Viva In Motion. */
export const galleryVideos: GalleryVideo[] = [
  {
    id: 'v3',
    src: '/videos/reel-03.mp4',
    poster: '/videos/reel-03-poster.jpg',
    alt: 'Reel Instagram Viva Stil — pedichiură',
  },
  {
    id: 'v1',
    src: '/videos/reel-01.mp4',
    poster: '/videos/reel-01-poster.jpg',
    alt: 'Reel Instagram Viva Stil',
  },
  {
    id: 'v2',
    src: '/videos/reel-02.mp4',
    poster: '/videos/reel-02-poster.jpg',
    alt: 'Reel Instagram Viva Stil',
  },
]

export const heroImage = {
  src: '/hero-poster.jpg',
  alt: 'Experiență premium la Viva Stil',
}

/** Două clipuri Pinterest — hero le joacă în continuitate, cu crossfade. */
export const heroVideos = [
  {
    src: '/hero-a.mp4',
    poster: '/hero-a-poster.jpg',
    sourceUrl: 'https://www.pinterest.com/pin/1145251380269186859/',
  },
  {
    src: '/hero-b.mp4',
    poster: '/hero-b-poster.jpg',
    sourceUrl: 'https://www.pinterest.com/pin/1053912750319748490/',
  },
] as const

export const heroVideo = {
  src: heroVideos[0].src,
  poster: heroVideos[0].poster,
  sourceUrl: heroVideos[0].sourceUrl,
}

export const aboutImage = {
  src: '/about.jpg',
  alt: 'Fațada Viva Stil',
}

/** Fundal secțiune Final CTA — Pinterest pin. */
export const finalCtaImage = {
  src: '/final-cta.jpg',
  alt: 'Atmosferă salon — moment de răsfăț',
  sourceUrl: 'https://ro.pinterest.com/pin/656821926987106229/',
}

export const mapsUrl =
  'https://www.google.com/maps/place/Viva+Stil/@44.423714,26.1198544,17z/data=!3m1!4b1!4m6!3m5!1s0x40b1ff1fbd0fe4d9:0xdcfaaacdda79d738!8m2!3d44.423714!4d26.1198544!16s%2Fg%2F11d_v9rgt9'
