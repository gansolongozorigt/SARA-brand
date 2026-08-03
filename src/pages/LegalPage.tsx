import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLang, useT } from '../i18n/LanguageContext'
import { legalContent } from '../content/legal'
import type { LegalDocKey, LegalItem } from '../content/legal'

/** A clause line that carries its own "2.1." style number. */
const isNumbered = (s: string) => /^\d+(\.\d+)*\.\s/.test(s)

/** Quote block — thin gold left border, tinted background, italic. Renders the
 *  Mongolian original underneath a translation when one is supplied. */
function Quote({ text, original }: { text: string; original?: string }) {
  const t = useT()
  return (
    <blockquote className="my-[18px] border-l-2 border-[#C5A059] bg-[rgba(197,160,89,0.07)] px-[20px] py-[14px]">
      <p className="whitespace-pre-line font-serif text-[15.5px] italic leading-[1.7] text-ink">{text}</p>
      {original && (
        <p className="mt-[10px] whitespace-pre-line border-t border-[#C5A059]/25 pt-[10px] text-[13px] italic leading-[1.6] text-muted">
          <span className="mr-[6px] font-sans text-[11px] uppercase not-italic tracking-[0.1em] text-[#C5A059]">
            {t('legalMongolianOriginal')}
          </span>
          {original}
        </p>
      )}
    </blockquote>
  )
}

/** One content item: quote block, numbered clause, or sub-bullet. */
function Item({ item }: { item: LegalItem }) {
  if (typeof item !== 'string') return <Quote text={item.text} original={item.original} />
  if (isNumbered(item)) return <p className="mt-[10px] text-[15px] leading-[1.75] text-charcoal">{item}</p>
  // Un-numbered line → sub-bullet with a small gold marker.
  return (
    <p className="mt-[8px] flex gap-[10px] pl-[6px] text-[15px] leading-[1.75] text-charcoal">
      <span aria-hidden className="mt-[10px] h-[5px] w-[5px] shrink-0 rounded-full bg-[#C5A059]" />
      <span>{item}</span>
    </p>
  )
}

export default function LegalPage({ docKey }: { docKey: LegalDocKey }) {
  const { lang } = useLang()
  const t = useT()
  const doc = legalContent[lang][docKey]

  // Per-page SEO: document title + meta description, restored on unmount.
  useEffect(() => {
    const prevTitle = document.title
    document.title = `${doc.title} — SARA`
    const meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute('content') ?? null
    // First real clause (number stripped) makes a faithful, localized description.
    const firstLine = doc.sections[0]?.items.find((i): i is string => typeof i === 'string') ?? ''
    const desc = `${doc.title} — SARA BRAND (sarabrand.mn). ${firstLine.replace(/^\d+(\.\d+)*\.\s*/, '')}`.slice(0, 300)
    meta?.setAttribute('content', desc)
    // Legal pages should be crawlable but scroll to the top on entry.
    window.scrollTo({ top: 0 })
    return () => {
      document.title = prevTitle
      if (meta && prevDesc !== null) meta.setAttribute('content', prevDesc)
    }
  }, [doc])

  return (
    <motion.section
      // TASK 5: entering a legal page fades in with a small upward slide (~350ms).
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className="legal bg-offwhite"
    >
      <div className="mx-auto w-full max-w-[760px] px-[24px] pb-[100px] pt-[56px] max-[680px]:pt-[40px]">
        {/* Title + effective / last-updated */}
        <h1 className="font-serif text-[clamp(28px,4.6vw,42px)] font-semibold leading-[1.14] text-ink">{doc.title}</h1>
        <p className="mt-[12px] text-[12.5px] tracking-[0.02em] text-muted">
          {t('legalEffective')}: {doc.effectiveDate} · {t('legalUpdated')}: {doc.updatedDate}
        </p>
        <div className="mt-[20px] h-px w-[56px] bg-[#C5A059]/70" />

        {/* Numbered sections — measure held to ~68ch for comfortable reading */}
        <div className="mt-[36px] max-w-[68ch]">
          {doc.sections.map((section, i) => (
            <section key={i} className="mt-[34px] first:mt-0">
              <h2 className="font-serif text-[20px] font-semibold leading-snug text-ink max-[680px]:text-[18px]">
                <span className="mr-[10px] text-[#8c6f2a]">{i + 1}.</span>
                {section.heading}
              </h2>
              <div className="mt-[10px]">
                {section.items.map((item, j) => (
                  <Item key={j} item={item} />
                ))}
              </div>
            </section>
          ))}

          {/* Хуулийн үндэслэл — visually separated block at the end */}
          <section className="mt-[48px] rounded-[16px] border border-[#C5A059]/25 bg-[rgba(197,160,89,0.05)] p-[24px] max-[680px]:p-[20px]">
            <h2 className="font-serif text-[19px] font-semibold text-ink">{t('legalBasisHeading')}</h2>
            <p className="mt-[10px] text-[15px] font-medium text-charcoal">
              {doc.legalBasis.lawName} <span className="text-muted">{doc.legalBasis.lawMeta}</span>
            </p>
            <div className="mt-[8px]">
              {doc.legalBasis.points.map((item, j) => (
                <Item key={j} item={item} />
              ))}
            </div>
          </section>

          {/* Precedence-of-Mongolian notice — foot of every page */}
          <p className="mt-[34px] border-t border-line pt-[18px] text-[12.5px] italic leading-[1.7] text-muted">
            {doc.languageNotice}
          </p>

          <div className="mt-[30px]">
            <Link
              to="/"
              className="text-[13px] text-gold3 underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              ← {t('coBackShop')}
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
