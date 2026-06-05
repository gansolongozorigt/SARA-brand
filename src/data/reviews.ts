export interface Review {
  initial: string
  rating: number
  name: string
  role: string
  text: string
}

/**
 * Customer reviews — mirrors the design reference's REVIEWS array (English text).
 * The `initial` avatar letters are the demo's (Cyrillic), kept as-is for fidelity.
 */
export const REVIEWS: Review[] = [
  {
    initial: 'Б',
    rating: 5,
    name: 'Bolormaa G.',
    role: 'Loyal customer',
    text: 'The camel milk cream truly softened my skin. The scent is lovely too.',
  },
  {
    initial: 'С',
    rating: 5,
    name: 'Saraa D.',
    role: 'New customer',
    text: 'The ampoule mask brightened my skin in two weeks. Highly recommend!',
  },
  {
    initial: 'Э',
    rating: 5,
    name: 'Enkhjin B.',
    role: 'Beauty blogger',
    text: 'The packaging and quality are luxurious. Proud of a Mongolian brand like this.',
  },
]
