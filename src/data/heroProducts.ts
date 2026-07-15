import { PRODUCTS, type Product } from './products'

export type Mood = 'gold' | 'mint'

export interface HeroProduct extends Product {
  mood: Mood
}

// Hero coverflow order + mood per card — visually strong picks from the real catalog.
const HERO_ORDER: { id: string; mood: Mood }[] = [
  { id: 'noire', mood: 'gold' },
  { id: 'etree_perfume', mood: 'mint' },
  { id: 'sunscreen_set', mood: 'gold' },
  { id: 'camel_cream', mood: 'mint' },
  { id: 'ampoule_mask', mood: 'gold' },
  { id: 'skin_set', mood: 'mint' },
]

export const HERO_PRODUCTS: HeroProduct[] = HERO_ORDER.map(({ id, mood }) => {
  const product = PRODUCTS.find((p) => p.id === id)
  if (!product) throw new Error(`Hero product not found: ${id}`)
  return { ...product, mood }
})

/** Ambient orb colors [--m1, --m2] per mood, from the demo's MOODS. */
export const MOODS: Record<Mood, [string, string]> = {
  gold: ['#d9bd7e', '#b4923c'],
  mint: ['#a9d8c2', '#6fae93'],
}
