import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useT } from '../i18n/LanguageContext'
import type { TranslationKey } from '../i18n'

// Fade + slide-up as the element scrolls into view (runs once).
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] as const, delay },
})

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#C5A059" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 4 13c0-4 3-8 9-9 0 6-1 11-9 16" />
      <path d="M11 20c0-5 2-8 6-10" />
    </svg>
  )
}
function BadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#C5A059" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="6" />
      <path d="M8.5 14 7 22l5-2.6L17 22l-1.5-8" />
    </svg>
  )
}
function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#C5A059" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  )
}

const VALUES: { Icon: () => ReactElement; title: TranslationKey; desc: TranslationKey }[] = [
  { Icon: LeafIcon, title: 'aboutValue1Title', desc: 'aboutValue1Desc' },
  { Icon: BadgeIcon, title: 'aboutValue2Title', desc: 'aboutValue2Desc' },
  { Icon: SparkleIcon, title: 'aboutValue3Title', desc: 'aboutValue3Desc' },
]

export default function About() {
  const t = useT()
  return (
    <section className="page mx-auto w-full max-w-[1080px] px-[24px] pb-[100px] pt-[64px] max-[680px]:pt-[44px]">
      {/* Hero */}
      <motion.div {...rise()} className="text-center">
        <div className="text-[12px] font-semibold uppercase tracking-[0.28em] text-gold3">{t('aboutEyebrow')}</div>
        <h1 className="mx-auto mt-[14px] max-w-[760px] font-serif text-[clamp(30px,5vw,52px)] font-semibold leading-[1.12] text-charcoal">
          {t('aboutHeroTitle')}
        </h1>
        <div className="mx-auto mt-[26px] h-px w-[72px] bg-gold/70" />
      </motion.div>

      {/* Story */}
      <motion.p {...rise(0.05)} className="mx-auto mt-[40px] max-w-[640px] text-center text-[15.5px] leading-[1.95] text-muted">
        {t('aboutStory')}
      </motion.p>

      {/* Values */}
      <motion.h2 {...rise()} className="mt-[76px] text-center font-serif text-[clamp(25px,4vw,38px)] font-semibold text-charcoal">
        {t('aboutValuesTitle')}
      </motion.h2>

      <div className="mt-[34px] flex flex-col gap-[20px] md:grid md:grid-cols-3 md:gap-[22px]">
        {VALUES.map((v, i) => (
          <motion.div
            key={v.title}
            {...rise(0.08 + i * 0.12)}
            className="rounded-[18px] border border-gold/25 bg-offwhite p-[30px] text-center transition-shadow duration-300 hover:shadow-[0_24px_50px_-30px_rgba(140,111,42,0.5)]"
          >
            <span className="mx-auto flex h-[58px] w-[58px] items-center justify-center rounded-full bg-beige/60">
              <v.Icon />
            </span>
            <h3 className="mt-[18px] font-serif text-[20px] font-semibold text-charcoal">{t(v.title)}</h3>
            <p className="mt-[8px] text-[14px] leading-[1.6] text-muted">{t(v.desc)}</p>
          </motion.div>
        ))}
      </div>

      {/* Closing */}
      <motion.div {...rise()} className="mt-[84px] text-center">
        <p className="mx-auto max-w-[640px] font-serif text-[clamp(22px,3.2vw,30px)] font-medium italic leading-[1.4] text-charcoal">
          {t('aboutClosing')}
        </p>
        <Link to="/" className="btn btn-gold mt-[30px]">
          {t('ctaShop')}
        </Link>
      </motion.div>
    </section>
  )
}
