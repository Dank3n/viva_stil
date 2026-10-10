export type ScheduleItem = {
  days: string
  hours: string
}

export type BusinessInfo = {
  name: string
  shortName: string
  tagline: string
  phone: string
  email: string
  address: string
  city: string
  instagram: string
  instagramUrl: string
  facebookUrl: string
  schedule: ScheduleItem[]
  seo: {
    title: string
    description: string
  }
}

export const businessInfo: BusinessInfo = {
  name: 'Viva Stil',
  shortName: 'VIVA',
  tagline: 'Beauty. Care. Confidence.',
  phone: '0723 858 697',
  email: '',
  address: 'Bulevardul Octavian Goga Nr. 22',
  city: 'București 030984',
  instagram: '@vivastil.22',
  instagramUrl: 'https://www.instagram.com/vivastil.22/',
  facebookUrl: 'https://www.facebook.com/p/Viva-Stil-61568738710599/',
  schedule: [
    { days: 'Luni – Vineri', hours: '08:00 – 22:00' },
    { days: 'Sâmbătă', hours: '08:00 – 19:00' },
    { days: 'Duminică', hours: 'Închis' },
  ],
  seo: {
    title: 'Viva Stil — Beauty, Care & Confidence',
    description:
      'Viva Stil — salon de frumusețe pe Bulevardul Octavian Goga 22, București. Programează-te online.',
  },
}
