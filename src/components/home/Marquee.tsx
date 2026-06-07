import { PRODUCTS } from '../../data/products'
import { useLang } from '../../i18n/LanguageContext'

export default function Marquee() {
  const { lang } = useLang()
  // First word of the first 8 products' names in the active language (mirrors the demo).
  const words = PRODUCTS.slice(0, 8).map((p) => p.name[lang].split(' ')[0])
  // Duplicate so the -50% scroll animation loops seamlessly.
  const track = [...words, ...words]
  return (
    <div className="marquee">
      <div className="track">
        {track.map((word, i) => (
          <span key={i}>{word}</span>
        ))}
      </div>
    </div>
  )
}
