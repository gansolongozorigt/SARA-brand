import aboutImg from '../../assets/about.jpg'
import { useT } from '../../i18n/LanguageContext'
import type { TranslationKey } from '../../i18n'

// Stat numbers are static; labels are localized. Languages is now 4 (МН/EN/中文/RU).
const STATS: { n: string; key: TranslationKey }[] = [
  { n: '11+', key: 'statProducts' },
  { n: '100%', key: 'statNatural' },
  { n: '4', key: 'statLang' },
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
