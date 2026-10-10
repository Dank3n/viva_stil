export type Service = {
  id: string
  name: string
  description: string
  duration: string
  price: string
  category: string
}

/** Ordinea categoriilor — aliniată cu lista de prețuri din salon. */
export const serviceCategories = [
  'Spălat',
  'Tratament',
  'Colorare',
  'Permanent',
  'Coafuri din perie',
  'Coafuri din perie + placă / ondulator',
  'Coafuri extensii',
  'Coafuri speciale',
  'Manichiură - Pedichiură',
] as const

export type ServiceCategory = (typeof serviceCategories)[number]

/** Catalog servicii — sursă pentru listă și fluxul de programări. */
export const services: Service[] = [
  // Spălat
  {
    id: 'spalat-wella',
    name: 'Spălat Wella',
    description: '20 ml șampon + 10 ml mască + manoperă.',
    duration: '20 min',
    price: '20 lei',
    category: 'Spălat',
  },
  {
    id: 'spalat-alfaparf',
    name: 'Spălat Alfaparf',
    description: '20 ml șampon + 10 ml mască + manoperă.',
    duration: '20 min',
    price: '30 lei',
    category: 'Spălat',
  },
  {
    id: 'spalat-sweet',
    name: 'Spălat Sweet Professional',
    description: '20 ml șampon + 10 ml mască + manoperă.',
    duration: '20 min',
    price: '40 lei',
    category: 'Spălat',
  },
  {
    id: 'spalat-dupa-vopsit-wella',
    name: 'Spălat după vopsit Wella',
    description: '30 ml șampon + 15 ml mască + manoperă.',
    duration: '25 min',
    price: '35 lei',
    category: 'Spălat',
  },
  {
    id: 'spalat-dupa-vopsit-alfaparf',
    name: 'Spălat după vopsit Alfaparf',
    description: '30 ml șampon + 15 ml mască + manoperă.',
    duration: '25 min',
    price: '45 lei',
    category: 'Spălat',
  },
  {
    id: 'spalat-dupa-vopsit-sweet',
    name: 'Spălat după vopsit Sweet Professional',
    description: '30 ml șampon + 15 ml mască + manoperă.',
    duration: '25 min',
    price: '50 lei',
    category: 'Spălat',
  },
  {
    id: 'spalat-dupa-permanent',
    name: 'Spălat după permanent',
    description: '30 ml șampon + 15 ml mască + manoperă.',
    duration: '25 min',
    price: '30 lei',
    category: 'Spălat',
  },
  {
    id: 'spalat-nuantator',
    name: 'Spălat nuanțator',
    description: '20 ml șampon + 20 ml mască + manoperă.',
    duration: '25 min',
    price: '40 lei',
    category: 'Spălat',
  },

  // Tratament
  {
    id: 'tratament-sweet',
    name: 'Tratament Sweet Professional 30 minute',
    description:
      '20 ml șampon + 30 ml mască + 5 picături serum + hairspa + manoperă.',
    duration: '30 min',
    price: '100 lei',
    category: 'Tratament',
  },
  {
    id: 'tratament-moroccanoil',
    name: 'Tratament Moroccanoil 30 minute',
    description:
      '20 ml șampon + 30 ml mască + 5 picături serum + hairspa + manoperă.',
    duration: '30 min',
    price: '100 lei',
    category: 'Tratament',
  },
  {
    id: 'tratament-olaplex',
    name: 'Tratament Olaplex 30 minute',
    description: '20 ml șampon + 30 ml mască + 1 fiolă + hairspa + manoperă.',
    duration: '30 min',
    price: '100 lei',
    category: 'Tratament',
  },
  {
    id: 'masca-hidratare',
    name: 'Mască hidratare 15 minute',
    description: '20 ml șampon + 30 ml mască + manoperă.',
    duration: '15 min',
    price: '50 lei',
    category: 'Tratament',
  },

  // Colorare
  {
    id: 'vopsit-1-tub',
    name: 'Vopsit 1 tub',
    description: '60 ml vopsea + 60 ml oxidant + manoperă.',
    duration: '1 h 30 min',
    price: '100 lei',
    category: 'Colorare',
  },
  {
    id: 'vopsit-1-tub-jumatate',
    name: 'Vopsit 1 tub și ½',
    description: '90 ml vopsea + 90 ml oxidant + manoperă.',
    duration: '1 h 45 min',
    price: '150 lei',
    category: 'Colorare',
  },
  {
    id: 'vopsit-2-tuburi',
    name: 'Vopsit 2 tuburi',
    description: '120 ml vopsea + 120 ml oxidant + manoperă.',
    duration: '2 h',
    price: '200 lei',
    category: 'Colorare',
  },
  {
    id: 'decolorat-1-cupa',
    name: 'Decolorat 1 cupă',
    description: '30 g pudră decolorantă + 60 ml oxidant + manoperă.',
    duration: '45 min',
    price: '30 lei',
    category: 'Colorare',
  },
  {
    id: 'decolorat-2-cupe',
    name: 'Decolorat 2 cupe',
    description: '60 g pudră decolorantă + 120 ml oxidant + manoperă.',
    duration: '1 h',
    price: '60 lei',
    category: 'Colorare',
  },
  {
    id: 'decolorat-3-cupe',
    name: 'Decolorat 3 cupe',
    description: '90 g pudră decolorantă + 180 ml oxidant + manoperă.',
    duration: '1 h 15 min',
    price: '90 lei',
    category: 'Colorare',
  },
  {
    id: 'fiola-olaplex',
    name: 'Fiolă Olaplex',
    description: '5 ml.',
    duration: '15 min',
    price: '30 lei',
    category: 'Colorare',
  },

  // Permanent
  {
    id: 'permanent-par-scurt',
    name: 'Permanent păr scurt',
    description: '30 ml soluție permanentă + 25 ml neutralizant.',
    duration: '1 h 30 min',
    price: '50 lei',
    category: 'Permanent',
  },
  {
    id: 'permanent-par-mediu',
    name: 'Permanent păr mediu',
    description: '40 ml soluție + 35 ml neutralizant.',
    duration: '1 h 45 min',
    price: '100 lei',
    category: 'Permanent',
  },
  {
    id: 'permanent-par-lung',
    name: 'Permanent păr lung',
    description: '50 ml soluție permanentă + 45 ml neutralizant.',
    duration: '2 h',
    price: '150 lei',
    category: 'Permanent',
  },

  // Coafuri din perie
  {
    id: 'coafat-perie-scurt',
    name: 'Coafat păr scurt',
    description: 'Coafură din perie.',
    duration: '30 min',
    price: '50 lei',
    category: 'Coafuri din perie',
  },
  {
    id: 'coafat-perie-mediu',
    name: 'Coafat păr mediu',
    description: 'Coafură din perie.',
    duration: '40 min',
    price: '60 lei',
    category: 'Coafuri din perie',
  },
  {
    id: 'coafat-perie-lung',
    name: 'Coafat păr lung',
    description: 'Coafură din perie.',
    duration: '50 min',
    price: '70 lei',
    category: 'Coafuri din perie',
  },

  // Coafuri din perie + placă / ondulator
  {
    id: 'coafat-placa-scurt',
    name: 'Coafat păr scurt',
    description: 'Coafură din perie + placă / ondulator.',
    duration: '40 min',
    price: '60 lei',
    category: 'Coafuri din perie + placă / ondulator',
  },
  {
    id: 'coafat-placa-mediu',
    name: 'Coafat păr mediu',
    description: 'Coafură din perie + placă / ondulator.',
    duration: '50 min',
    price: '70 lei',
    category: 'Coafuri din perie + placă / ondulator',
  },
  {
    id: 'coafat-placa-lung',
    name: 'Coafat păr lung',
    description: 'Coafură din perie + placă / ondulator.',
    duration: '1 h',
    price: '80 lei',
    category: 'Coafuri din perie + placă / ondulator',
  },

  // Coafuri extensii
  {
    id: 'coafat-extensii-mediu',
    name: 'Coafat păr mediu',
    description: 'Coafură pentru extensii.',
    duration: '1 h',
    price: '90 lei',
    category: 'Coafuri extensii',
  },
  {
    id: 'coafat-extensii-lung',
    name: 'Coafat păr lung',
    description: 'Coafură pentru extensii.',
    duration: '1 h 15 min',
    price: '120 lei',
    category: 'Coafuri extensii',
  },

  // Coafuri speciale
  {
    id: 'coc-par-mediu',
    name: 'Coc păr mediu',
    description: 'Coafură specială.',
    duration: '1 h',
    price: '120 lei',
    category: 'Coafuri speciale',
  },
  {
    id: 'coafat-special-lung',
    name: 'Coafat păr lung',
    description: 'Coafură specială.',
    duration: '1 h 15 min',
    price: '150 lei',
    category: 'Coafuri speciale',
  },
  {
    id: 'coc-mireasa',
    name: 'Coc mireasă',
    description: 'Coafură specială pentru mireasă.',
    duration: '1 h 30 min',
    price: '200 lei',
    category: 'Coafuri speciale',
  },

  // Manichiură - Pedichiură
  {
    id: 'manichiura-clasica',
    name: 'Manichiură clasică',
    description: 'Curățat cuticule + bază + ojă / lac + ulei.',
    duration: '40 min',
    price: '60 lei',
    category: 'Manichiură - Pedichiură',
  },
  {
    id: 'pedichiura-clasica',
    name: 'Pedichiură clasică',
    description: 'Curățat cuticule + bază + ojă / lac + ulei.',
    duration: '50 min',
    price: '70 lei',
    category: 'Manichiură - Pedichiură',
  },
  {
    id: 'pedichiura-barbati',
    name: 'Pedichiură bărbați',
    description: 'Curățat cuticule.',
    duration: '40 min',
    price: '60 lei',
    category: 'Manichiură - Pedichiură',
  },
  {
    id: 'manichiura-semipermanenta',
    name: 'Manichiură semipermanentă',
    description: 'Curățat cuticule + bază + ojă semipermanentă + top.',
    duration: '1 h',
    price: '120 lei',
    category: 'Manichiură - Pedichiură',
  },
  {
    id: 'manichiura-semi-apex',
    name: 'Manichiură semipermanentă cu apex',
    description: 'Curățat cuticule + bază apex + ojă semipermanentă + top.',
    duration: '1 h 15 min',
    price: '140 lei',
    category: 'Manichiură - Pedichiură',
  },
  {
    id: 'pedichiura-semipermanenta',
    name: 'Pedichiură semipermanentă',
    description: 'Curățat cuticule + bază + ojă semipermanentă + top.',
    duration: '1 h 10 min',
    price: '130 lei',
    category: 'Manichiură - Pedichiură',
  },
  {
    id: 'constructie-gel-smart-forms',
    name: 'Construcție gel Smart Forms',
    description: 'Curățat cuticule + bază + gel + ojă semipermanentă + top.',
    duration: '2 h',
    price: '250 lei',
    category: 'Manichiură - Pedichiură',
  },
  {
    id: 'constructie-gel-forma',
    name: 'Construcție gel în funcție de formă și lungime',
    description: 'Curățat cuticule + bază + gel + ojă semipermanentă + top.',
    duration: '2 h 30 min',
    price: '280 – 300 lei',
    category: 'Manichiură - Pedichiură',
  },
  {
    id: 'intretinere-gel',
    name: 'Întreținere gel în funcție de formă și lungime',
    description: 'Curățat cuticule + bază + gel + ojă semipermanentă + top.',
    duration: '1 h 45 min',
    price: '170 – 250 lei',
    category: 'Manichiură - Pedichiură',
  },
  {
    id: 'protectie-gel-naturala',
    name: 'Protecție gel pe unghie naturală',
    description: 'Curățat cuticule + bază + gel + ojă semipermanentă + top.',
    duration: '1 h 20 min',
    price: '150 lei',
    category: 'Manichiură - Pedichiură',
  },
  {
    id: 'reparat-unghie-gel',
    name: 'Reparat o unghie gel',
    description: 'Bază + gel + ojă semipermanentă + top.',
    duration: '20 min',
    price: '30 lei',
    category: 'Manichiură - Pedichiură',
  },
  {
    id: 'indepartat-gel',
    name: 'Îndepărtat gel',
    description: '',
    duration: '20 min',
    price: '30 lei',
    category: 'Manichiură - Pedichiură',
  },
  {
    id: 'indepartat-oja-semipermanenta',
    name: 'Îndepărtat ojă semipermanentă',
    description: '',
    duration: '15 min',
    price: '20 lei',
    category: 'Manichiură - Pedichiură',
  },
  {
    id: 'model-o-unghie',
    name: 'Model pe o unghie',
    description: '',
    duration: '10 min',
    price: '5 – 10 lei',
    category: 'Manichiură - Pedichiură',
  },
  {
    id: 'model-baby-boomer',
    name: 'Model Baby Boomer / French / Glitter Refill',
    description: '',
    duration: '15 min',
    price: '20 lei',
    category: 'Manichiură - Pedichiură',
  },
]

export function servicesByCategory() {
  return serviceCategories
    .map((category) => ({
      category,
      items: services.filter((service) => service.category === category),
    }))
    .filter((group) => group.items.length > 0)
}
