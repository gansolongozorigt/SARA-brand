import noire from '../assets/products/noire.jpg'
import sun from '../assets/products/sun.jpg'
import giftset from '../assets/products/giftset.jpg'
import camel from '../assets/products/camel.jpg'
import etree from '../assets/products/etree.jpg'
import ampoule from '../assets/products/ampoule.jpg'
import centella from '../assets/products/centella.jpg'
import whitetea from '../assets/products/whitetea.jpg'
import mask from '../assets/products/mask.jpg'
import hand from '../assets/products/hand.jpg'
import men from '../assets/products/men.jpg'

export type Category = 'skin' | 'perfume' | 'mask' | 'men' | 'set'
export type FilterKey = 'all' | Category

export interface Product {
  id: string
  name: string
  tag: string
  short: string
  price: number
  old?: number
  category: Category
  image: string
}

/**
 * Full product catalog — mirrors the design reference's PRODUCTS array (English text).
 * Static for now; replaced by live WooCommerce data in a later step.
 */
export const PRODUCTS: Product[] = [
  { id: 'noire',    name: 'SARA NOIRE Eau de Parfum',           tag: 'Perfume',      short: 'Deep, warm, unforgettable',       price: 159000,             category: 'perfume', image: noire },
  { id: 'sun',      name: 'Sun Protection SPF50+ Dual Essence', tag: 'Protection',   short: 'Hydration + protection in one',   price: 65000,              category: 'skin',    image: sun },
  { id: 'giftset',  name: 'Brightening Skin Set Box',           tag: 'Set',          short: 'Complete ritual · 5 steps',       price: 249000,             category: 'set',     image: giftset },
  { id: 'camel',    name: 'Camel Milk Cactus Cream',            tag: 'Cream',        short: 'Deep moisture, silky skin',       price: 89000,              category: 'skin',    image: camel },
  { id: 'etree',    name: 'SARA ÉTRÉE Eau de Parfum',           tag: 'Perfume',      short: 'Cool, fresh green notes',         price: 129000,             category: 'perfume', image: etree },
  { id: 'ampoule',  name: 'Anti-Aging Ampoule Mask',            tag: 'Mask · Sale',  short: '4 patented essences · 20 sticks', price: 69000,  old: 99000, category: 'mask',    image: ampoule },
  { id: 'centella', name: 'Centella Soothing Cleansing Cream',  tag: 'Cleansing',    short: 'Gentle cleanse, soothing',        price: 49000,              category: 'skin',    image: centella },
  { id: 'whitetea', name: 'White Tea Cleansing Oil',            tag: 'Cleansing',    short: 'Shining, crystal-clear skin',     price: 55000,              category: 'skin',    image: whitetea },
  { id: 'mask',     name: 'Brightening Relief Sheet Mask',      tag: 'Mask',         short: 'Brighten · repair',               price: 59000,              category: 'mask',    image: mask },
  { id: 'hand',     name: 'Perfume Hand Cream',                 tag: 'Cream · Sale', short: 'Moisturizing, lovely scent',      price: 7900,   old: 9900,  category: 'skin',    image: hand },
  { id: 'men',      name: 'SARA Specialty Men Set',             tag: 'For Men',      short: 'Oil-control · refreshing',        price: 119000,             category: 'men',     image: men },
]

/** Filter pills — keys mirror the demo's FILTERS + FILTER_KEY (English labels). */
export const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',     label: 'All' },
  { key: 'skin',    label: 'Skincare' },
  { key: 'perfume', label: 'Perfume' },
  { key: 'mask',    label: 'Masks' },
  { key: 'men',     label: 'For Men' },
  { key: 'set',     label: 'Sets' },
]

/** Price formatter — matches the demo's fmt(): "159,000₮". */
export const formatPrice = (n: number): string => n.toLocaleString('en-US') + '₮'
