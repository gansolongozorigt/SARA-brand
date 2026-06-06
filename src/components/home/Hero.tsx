import Coverflow from './Coverflow'
import { useT } from '../../i18n/LanguageContext'

export default function Hero() {
  const t = useT()
  return (
    <section className="hero">
      <div>
        <span className="hero-badge">{t('heroBadge')}</span>
        <h1>
          <span className="gold-text">SARA</span>
          <span className="sub">{t('heroSub')}</span>
        </h1>
        <p className="lead">{t('heroLead')}</p>
        <div className="hero-cta">
          <a href="#products" className="btn btn-gold">{t('ctaShop')}</a>
          <a href="#contact" className="btn btn-out">{t('ctaContact')}</a>
        </div>
      </div>

      <Coverflow />
    </section>
  )
}
