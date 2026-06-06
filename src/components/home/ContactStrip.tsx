import { useT } from '../../i18n/LanguageContext'

const PHONE = '+976 8998 3612'

export default function ContactStrip() {
  const t = useT()
  return (
    <section id="contact" className="contactstrip">
      <div className="in reveal">
        <h3>{t('contactH')}</h3>
        <div className="phone">
          <a href="tel:+97689983612">{PHONE}</a>
        </div>
      </div>
    </section>
  )
}
