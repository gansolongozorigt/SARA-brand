import type { ReactNode } from 'react'
import { useT } from '../../i18n/LanguageContext'
import type { TranslationKey } from '../../i18n'

interface InfoItem {
  icon: ReactNode
  titleKey: TranslationKey
  textKey: TranslationKey
}

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
  },
]

export default function InfoCards() {
  const t = useT()
  return (
    <section className="info-sec">
      {INFO.map((card) => (
        <div key={card.titleKey} className="info-card reveal">
          <div className="ic">{card.icon}</div>
          <h4>{t(card.titleKey)}</h4>
          <p>{t(card.textKey)}</p>
        </div>
      ))}
    </section>
  )
}
