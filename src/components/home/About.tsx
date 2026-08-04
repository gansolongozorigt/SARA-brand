import aboutImg from '../../assets/about.jpg'
import { useT } from '../../i18n/LanguageContext'
import type { TranslationKey } from '../../i18n'
import { LANGUAGES } from '../../i18n'
import { PRODUCTS } from '../../data/products'

// Every stat is DERIVED from real data so it never goes stale and stays legally
// defensible: product count and distinct-category count from the catalogue,
// language count from the locale list. (The old "100% natural" claim was dropped
// — it isn't defensible for a range that includes SPF 50 and peptide serums; the
// softer "naturally derived" wording lives in the hero paragraph instead.)
const CATEGORY_COUNT = new Set(PRODUCTS.map((p) => p.category)).size
const STATS: { n: string; key: TranslationKey }[] = [
  { n: String(PRODUCTS.length), key: 'statProducts' },
  { n: String(CATEGORY_COUNT), key: 'statCategories' },
  { n: String(LANGUAGES.length), key: 'statLang' },
]

export default function About() {
  const t = useT()
  return (
    <section id="about" className="about">
      <div className="about-img reveal">
        <img src={aboutImg} alt="SARA beauty products" />
      </div>
      <div className="about-txt reveal">
        <span className="sec-kick">{t('aboutKick')}</span>
        <h2>{t('aboutTitle')}</h2>
        <p>{t('aboutP1')}</p>
        <p>{t('aboutP2')}</p>
        <div className="about-stats">
          {STATS.map((s) => (
            <div key={s.key}>
              <div className="n">{s.n}</div>
              <div className="l">{t(s.key)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
