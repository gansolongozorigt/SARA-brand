import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'
import { useT } from '../i18n/LanguageContext'
import type { TranslationKey } from '../i18n'
import { submitContact } from '../lib/submitContact'

const PHONE_DISPLAY = '89983612'
const PHONE_TEL = '+97689983612'
const EMAIL = 'info@sarabrand.mn'
const FACEBOOK = 'https://www.facebook.com/Sarainternationaltrade'
const MESSENGER = 'https://m.me/Sarainternationaltrade'

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] as const, delay },
})

function InfoRow({ label, children }: { label: TranslationKey; children: React.ReactNode }) {
  const t = useT()
  return (
    <div>
      <div className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-gold3">{t(label)}</div>
      <div className="mt-[4px] text-[15px] leading-[1.55] text-charcoal">{children}</div>
    </div>
  )
}

export default function Contact() {
  const t = useT()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ name?: boolean; message?: boolean }>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [failed, setFailed] = useState(false)

  async function handleSubmit() {
    if (sending) return
    const e = { name: !name.trim(), message: !message.trim() }
    setErrors(e)
    if (e.name || e.message) return

    setFailed(false)
    setSending(true)
    const res = await submitContact({
      name: name.trim(),
      phone: phone.trim() || undefined,
      message: message.trim(),
    })
    setSending(false)

    if (res.ok) {
      setSent(true)
      setName('')
      setPhone('')
      setMessage('')
      setErrors({})
    } else {
      setFailed(true)
    }
  }

  return (
    <section className="page mx-auto w-full max-w-[1080px] px-[24px] pb-[100px] pt-[64px] max-[680px]:pt-[44px]">
      <motion.div {...rise()} className="text-center">
        <h1 className="font-serif text-[clamp(30px,5vw,46px)] font-semibold leading-[1.12] text-charcoal">{t('contactTitle')}</h1>
        <p className="mx-auto mt-[12px] max-w-[480px] text-[15px] text-muted">{t('contactSubtitle')}</p>
        <div className="mx-auto mt-[22px] h-px w-[64px] bg-gold/70" />
      </motion.div>

      <div className="mt-[48px] flex flex-col gap-[40px] lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-[56px] lg:items-start">
        {/* LEFT — contact info */}
        <motion.div {...rise(0.05)} className="flex flex-col gap-[22px]">
          <InfoRow label="contactLabelPhone">
            <a href={`tel:${PHONE_TEL}`} className="transition-colors hover:text-gold3">{PHONE_DISPLAY}</a>
          </InfoRow>
          <InfoRow label="contactLabelEmail">
            <a href={`mailto:${EMAIL}`} className="transition-colors hover:text-gold3">{EMAIL}</a>
          </InfoRow>
          <InfoRow label="contactLabelAddress">{t('contactValueAddress')}</InfoRow>
          <InfoRow label="contactLabelHours">{t('contactValueHours')}</InfoRow>

          <div className="mt-[4px] flex flex-wrap gap-[12px]">
            <a href={FACEBOOK} target="_blank" rel="noopener noreferrer" className="btn btn-out !px-[22px] !py-[12px] !text-[12px]">
              Facebook
            </a>
            <a href={MESSENGER} target="_blank" rel="noopener noreferrer" className="btn btn-out !px-[22px] !py-[12px] !text-[12px]">
              Messenger
            </a>
          </div>
        </motion.div>

        {/* RIGHT — message form */}
        <motion.div {...rise(0.12)} className="rounded-[20px] border border-line bg-ivory/70 p-[26px] backdrop-blur-[2px] max-[680px]:p-[20px]">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-[14px] border border-mint bg-mint/25 px-[20px] py-[22px] text-center"
            >
              <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#4f8e74" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-[10px]">
                <path d="M5 12l4.5 4.5L19 7" />
              </svg>
              <p className="text-[15px] font-medium text-charcoal">{t('contactFormSuccess')}</p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-[16px]">
              <label className="block">
                <span className="mb-[6px] block text-[12.5px] font-medium uppercase tracking-[0.07em] text-muted">{t('contactFormName')}</span>
                <input
                  className={cn('co-input', errors.name && 'err')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={sending}
                  autoComplete="name"
                />
              </label>

              <label className="block">
                <span className="mb-[6px] block text-[12.5px] font-medium uppercase tracking-[0.07em] text-muted">{t('contactFormPhone')}</span>
                <input
                  className="co-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={sending}
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>

              <label className="block">
                <span className="mb-[6px] block text-[12.5px] font-medium uppercase tracking-[0.07em] text-muted">{t('contactFormMessage')}</span>
                <textarea
                  className={cn('co-input co-textarea', errors.message && 'err')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sending}
                  rows={5}
                />
              </label>

              {failed && <p className="text-[13px] text-[#c0563d]">{t('coError')}</p>}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={sending}
                className={cn(
                  'gold-bg mt-[4px] w-full rounded-full py-[14px] text-[13px] font-semibold uppercase tracking-[0.08em] text-[#241c08] transition-transform duration-200',
                  sending ? 'cursor-wait animate-pulse opacity-80' : 'hover:-translate-y-[1px]',
                )}
              >
                {t('contactFormSubmit')}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
