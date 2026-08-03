import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../../i18n/LanguageContext'
import type { TranslationKey } from '../../i18n'

interface InfoItem {
  icon: ReactNode
  titleKey: TranslationKey
  textKey: TranslationKey
  to: string
}

// Each card is an entry point to its policy page. Real <Link>s → keyboard
// accessible, focus-ring visible. Motion is restrained (see .info-card in
// index.css): a 2–3px lift + a thin gold underline easing in over ~200ms, no
// rotation/bounce/scale. The route change itself fades + slides up on the
// destination page (see LegalPage).
const INFO: InfoItem[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6}>
        <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
        <circle cx="7" cy="18" r="1.6" />
        <circle cx="17.5" cy="18" r="1.6" />
      </svg>
    ),
    titleKey: 'delivTitle',
    textKey: 'delivText',
    to: '/delivery',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6}>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ),
    titleKey: 'payTitle',
    textKey: 'payText',
    to: '/payment',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6}>
        <path d="M3 12a9 9 0 109-9" />
        <path d="M3 5v4h4" />
      </svg>
    ),
    titleKey: 'retTitle',
    textKey: 'retText',
    to: '/returns',
  },
]

export default function InfoCards() {
  const t = useT()
  return (
    <section className="info-sec">
      {INFO.map((card) => (
        <Link key={card.titleKey} to={card.to} className="info-card reveal">
          <div className="ic">{card.icon}</div>
          <h4>{t(card.titleKey)}</h4>
          <p>{t(card.textKey)}</p>
          <span className="u" aria-hidden />
        </Link>
      ))}
    </section>
  )
}
