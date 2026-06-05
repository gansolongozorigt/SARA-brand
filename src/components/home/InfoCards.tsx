import type { ReactNode } from 'react'

interface InfoItem {
  icon: ReactNode
  title: string
  text: string
}

// Icons + English placeholder text from the design reference.
const INFO: InfoItem[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6}>
        <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
        <circle cx="7" cy="18" r="1.6" />
        <circle cx="17.5" cy="18" r="1.6" />
      </svg>
    ),
    title: 'Delivery',
    text: 'Same-day delivery in Ulaanbaatar. 2–4 days countryside. Free over 100,000₮.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6}>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ),
    title: 'Payment',
    text: 'Pay by QPay, bank transfer or cash. Safe and reliable.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6}>
        <path d="M3 12a9 9 0 109-9" />
        <path d="M3 5v4h4" />
      </svg>
    ),
    title: 'Returns',
    text: 'Unopened products can be exchanged or returned within 7 days.',
  },
]

export default function InfoCards() {
  return (
    <section className="info-sec">
      {INFO.map((card) => (
        <div key={card.title} className="info-card reveal">
          <div className="ic">{card.icon}</div>
          <h4>{card.title}</h4>
          <p>{card.text}</p>
        </div>
      ))}
    </section>
  )
}
