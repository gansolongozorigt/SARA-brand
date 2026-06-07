import { useLang } from '../../i18n/LanguageContext'
import { formatPriceParts } from '../../data/products'

/**
 * Renders a price as two separately-styleable spans: the numeric amount
 * (.price-num — inherits the surrounding big serif) and the currency unit
 * (.price-unit — smaller, lighter, muted). Language-aware: mn → ₮, others → MNT.
 */
export default function Price({ amount }: { amount: number }) {
  const { lang } = useLang()
  const { num, unit } = formatPriceParts(amount, lang)
  return (
    <>
      <span className="price-num">{num}</span>
      <span className="price-unit">{unit}</span>
    </>
  )
}
