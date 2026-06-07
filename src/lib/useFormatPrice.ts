import { useLang } from '../i18n/LanguageContext'
import { formatPrice } from '../data/products'

/**
 * Returns a price formatter bound to the active language:
 * Mongolian → "249,000₮", others → "249,000 MNT".
 */
export function useFormatPrice(): (n: number) => string {
  const { lang } = useLang()
  return (n: number) => formatPrice(n, lang)
}
