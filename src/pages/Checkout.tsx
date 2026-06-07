import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'
import { useCart, selectSubtotal } from '../store/cart'
import { PRODUCTS } from '../data/products'
import { useLang, useT } from '../i18n/LanguageContext'
import { useFormatPrice } from '../lib/useFormatPrice'
import { submitOrder, type Order, type OrderItem, type PaymentMethod } from '../lib/submitOrder'

// Shop's bank-transfer details shown on the confirmation screen.
const BANK = {
  bank: 'Хаан банк (Khan Bank)',
  account: '020005005720871790',
  recipient: 'Г.Урантуяа',
}

interface SummaryRow {
  id: string
  name: string
  qty: number
  lineTotal: number
}

type FieldKey = 'fullName' | 'phone' | 'city' | 'address' | 'email'

/** Order summary card — used both in the form view and the confirmation view. */
function OrderSummary({ rows, total }: { rows: SummaryRow[]; total: number }) {
  const t = useT()
  const fmt = useFormatPrice()
  return (
    <div className="rounded-[20px] border border-line bg-ivory/70 p-[22px] backdrop-blur-[2px]">
      <h2 className="font-serif text-[19px] font-semibold text-ink">{t('coSummary')}</h2>
      <ul className="mt-[16px] flex flex-col gap-[14px]">
        {rows.map((r) => {
          const p = PRODUCTS.find((x) => x.id === r.id)
          return (
            <li key={r.id} className="flex items-center gap-[12px]">
              <img
                src={p?.image}
                alt={r.name}
                className="h-[56px] w-[48px] shrink-0 rounded-[10px] object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-serif text-[14px] leading-tight text-ink">{r.name}</div>
                <div className="mt-[2px] text-[12px] text-muted">
                  {t('coQty')}: {r.qty}
                </div>
              </div>
              <div className="shrink-0 text-[13px] font-medium text-gold3">{fmt(r.lineTotal)}</div>
            </li>
          )
        })}
      </ul>
      <div className="mt-[18px] border-t border-line pt-[14px]">
        <div className="flex items-center justify-between text-[13px] text-muted">
          <span className="uppercase tracking-[0.08em]">{t('subtotal')}</span>
          <span>{fmt(total)}</span>
        </div>
        <div className="mt-[10px] flex items-baseline justify-between">
          <span className="text-[13px] uppercase tracking-[0.08em] text-ink">{t('grandTotal')}</span>
          <span className="font-serif text-[22px] font-semibold text-gold3">{fmt(total)}</span>
        </div>
      </div>
    </div>
  )
}

/** Bank-transfer instructions — confirmation view, bank payment only. */
function BankDetails() {
  const t = useT()
  const rows: [string, string, boolean][] = [
    [t('coBankBank'), BANK.bank, false],
    [t('coBankAcc'), BANK.account, true],
    [t('coBankRecipient'), BANK.recipient, false],
  ]
  return (
    <div className="mt-[20px] rounded-[18px] border border-gold/30 bg-paper p-[22px]">
      <h3 className="font-serif text-[18px] font-semibold text-ink">{t('coBankTitle')}</h3>
      <dl className="mt-[14px] flex flex-col gap-[10px]">
        {rows.map(([label, value, mono]) => (
          <div key={label} className="flex items-center justify-between gap-[16px]">
            <dt className="text-[12.5px] uppercase tracking-[0.06em] text-muted">{label}</dt>
            <dd
              className={cn(
                'select-all text-right text-[14px] font-medium text-ink',
                mono && 'font-mono tracking-[0.04em]',
              )}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-[14px] border-t border-line pt-[12px] text-[13px] leading-relaxed text-muted">
        {t('coBankNote')}
      </p>
    </div>
  )
}

/** Labeled field wrapper with optional tag + inline error. */
function Field({
  label,
  optional,
  error,
  children,
}: {
  label: string
  optional?: boolean
  error?: string
  children: React.ReactNode
}) {
  const t = useT()
  return (
    <label className="block">
      <span className="mb-[6px] flex items-center gap-[6px] text-[12.5px] font-medium uppercase tracking-[0.07em] text-muted">
        {label}
        {optional && <em className="not-italic lowercase tracking-normal text-[11px] text-muted/70">({t('coOptional')})</em>}
      </span>
      {children}
      {error && <span className="mt-[5px] block text-[12px] text-[#c0563d]">{error}</span>}
    </label>
  )
}

export default function Checkout() {
  const t = useT()
  const { lang } = useLang()
  const navigate = useNavigate()
  const items = useCart((s) => s.items)
  const subtotal = useCart(selectSubtotal)
  const clear = useCart((s) => s.clear)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>('bank')

  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [placed, setPlaced] = useState<Order | null>(null)

  // Live summary rows derived from the cart.
  const rows = useMemo<SummaryRow[]>(() => {
    return items.flatMap((it) => {
      const p = PRODUCTS.find((x) => x.id === it.id)
      return p ? [{ id: it.id, name: p.name[lang], qty: it.qty, lineTotal: p.price * it.qty }] : []
    })
  }, [items, lang])

  function validate(): boolean {
    const e: Partial<Record<FieldKey, string>> = {}
    if (!fullName.trim()) e.fullName = t('vName')
    if (!/^\d{8}$/.test(phone.replace(/\s+/g, ''))) e.phone = t('vPhone')
    if (!city.trim()) e.city = t('vCity')
    if (!address.trim()) e.address = t('vAddress')
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = t('vEmail')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handlePlaceOrder() {
    if (submitting) return
    if (!validate()) return
    setSubmitError(null)
    setSubmitting(true)

    const order: Order = {
      customer: {
        fullName: fullName.trim(),
        phone: phone.replace(/\s+/g, ''),
        city: city.trim(),
        address: address.trim(),
        email: email.trim() || undefined,
        note: note.trim() || undefined,
      },
      payment,
      items: items.flatMap<OrderItem>((it) => {
        const p = PRODUCTS.find((x) => x.id === it.id)
        return p
          ? [{ id: it.id, name: p.name[lang], qty: it.qty, unitPrice: p.price, lineTotal: p.price * it.qty }]
          : []
      }),
      total: subtotal,
      currencyLabel: lang === 'mn' ? '₮' : 'MNT',
    }

    const res = await submitOrder(order)
    if (res.ok) {
      setPlaced(order)
      clear()
      setSubmitting(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setSubmitting(false)
      setSubmitError(t('coError'))
    }
  }

  // ---------- Confirmation ----------
  if (placed) {
    const confirmRows: SummaryRow[] = placed.items.map((it) => ({
      id: it.id,
      name: it.name,
      qty: it.qty,
      lineTotal: it.lineTotal,
    }))
    return (
      <section className="mx-auto w-full max-w-[760px] px-[24px] pb-[90px] pt-[52px]">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}>
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 16 }}
              className="mx-auto mb-[18px] flex h-[66px] w-[66px] items-center justify-center rounded-full bg-[rgba(79,142,116,0.13)]"
            >
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#4f8e74" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l4.5 4.5L19 7" />
              </svg>
            </motion.div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-gold3">{t('coKick')}</div>
            <h1 className="mt-[6px] font-serif text-[34px] font-semibold leading-tight text-ink max-[680px]:text-[27px]">{t('coDoneTitle')}</h1>
            <p className="mx-auto mt-[10px] max-w-[470px] text-[14.5px] leading-relaxed text-muted">{t('coDoneMsg')}</p>
          </div>

          <div className="mt-[28px]">
            <OrderSummary rows={confirmRows} total={placed.total} />
          </div>

          {placed.payment === 'bank' && <BankDetails />}

          <div className="mt-[26px] text-center">
            <button type="button" onClick={() => navigate('/')} className="btn btn-gold">
              {t('coContinue')}
            </button>
          </div>
        </motion.div>
      </section>
    )
  }

  // ---------- Empty ----------
  if (rows.length === 0) {
    return (
      <section className="mx-auto flex min-h-[58vh] w-full max-w-[600px] flex-col items-center justify-center px-[24px] py-[70px] text-center">
        <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-gold3">{t('coKick')}</div>
        <h1 className="mt-[8px] font-serif text-[30px] font-semibold text-ink">{t('emptyCart')}</h1>
        <p className="mt-[10px] text-[14px] text-muted">{t('coEmptyMsg')}</p>
        <Link to="/" className="btn btn-gold mt-[22px]">{t('coBackShop')}</Link>
      </section>
    )
  }

  // ---------- Form + summary ----------
  const inputCls = 'co-input'
  return (
    <section className="mx-auto w-full max-w-[1080px] px-[24px] pb-[90px] pt-[46px]">
      <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-gold3">{t('coKick')}</div>
      <h1 className="mt-[6px] font-serif text-[34px] font-semibold leading-tight text-ink max-[680px]:text-[27px]">{t('coTitle')}</h1>

      <div className="mt-[28px] flex flex-col-reverse gap-[26px] lg:grid lg:grid-cols-[1fr_360px] lg:items-start">
        {/* Customer form */}
        <div className={cn('transition-opacity', submitting && 'pointer-events-none opacity-60')} aria-busy={submitting}>
          <h2 className="font-serif text-[19px] font-semibold text-ink">{t('coCustomer')}</h2>
          <div className="mt-[16px] flex flex-col gap-[16px]">
            <Field label={t('coFullName')} error={errors.fullName}>
              <input className={cn(inputCls, errors.fullName && 'err')} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('phName')} disabled={submitting} autoComplete="name" />
            </Field>

            <div className="flex flex-col gap-[16px] sm:flex-row">
              <div className="min-w-0 sm:flex-1">
                <Field label={t('fPhone')} error={errors.phone}>
                  <input className={cn(inputCls, errors.phone && 'err')} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('phPhone')} disabled={submitting} inputMode="numeric" autoComplete="tel" />
                </Field>
              </div>
              <div className="min-w-0 sm:flex-1">
                <Field label={t('coCity')} error={errors.city}>
                  <input className={cn(inputCls, errors.city && 'err')} value={city} onChange={(e) => setCity(e.target.value)} placeholder={t('phCity')} disabled={submitting} autoComplete="address-level2" />
                </Field>
              </div>
            </div>

            <Field label={t('coAddress')} error={errors.address}>
              <input className={cn(inputCls, errors.address && 'err')} value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t('phAddress')} disabled={submitting} autoComplete="street-address" />
            </Field>

            <Field label={t('fEmail')} optional error={errors.email}>
              <input className={cn(inputCls, errors.email && 'err')} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('phEmail')} disabled={submitting} inputMode="email" autoComplete="email" />
            </Field>

            <Field label={t('coNote')} optional>
              <textarea className={cn(inputCls, 'co-textarea')} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('phNote')} disabled={submitting} rows={3} />
            </Field>

            {/* Payment method */}
            <div>
              <span className="mb-[8px] block text-[12.5px] font-medium uppercase tracking-[0.07em] text-muted">{t('payMethod')}</span>
              <div className="flex flex-col gap-[10px] sm:flex-row">
                {(['bank', 'cod'] as PaymentMethod[]).map((m) => {
                  const active = payment === m
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayment(m)}
                      disabled={submitting}
                      className={cn(
                        'min-w-0 rounded-[14px] border p-[14px] text-left transition sm:flex-1',
                        active ? 'border-gold bg-[rgba(197,160,89,0.09)]' : 'border-line bg-white hover:border-gold/50',
                      )}
                    >
                      <span className="flex items-center gap-[9px]">
                        <span className={cn('flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border', active ? 'border-gold' : 'border-muted')}>
                          {active && <span className="h-[9px] w-[9px] rounded-full bg-gold" />}
                        </span>
                        <span className="text-[14px] font-medium text-ink">{m === 'bank' ? t('bankName') : t('cashName')}</span>
                      </span>
                      <span className="mt-[5px] block pl-[26px] text-[12.5px] text-muted">{m === 'bank' ? t('bankDesc') : t('cashDesc')}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Summary + place order (sticky on desktop) */}
        <div className="lg:sticky lg:top-[92px]">
          <OrderSummary rows={rows} total={subtotal} />

          {submitError && (
            <div className="mt-[14px] rounded-[12px] border border-[#e0b3a6] bg-[rgba(192,86,61,0.07)] px-[14px] py-[11px] text-[13px] text-[#a4452f]">
              {submitError}
            </div>
          )}

          {/* Premium loading shimmer while submitting */}
          {submitting && <div className="co-skel mt-[14px] h-[5px] w-full rounded-full" />}

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={submitting}
            className={cn(
              'gold-bg mt-[14px] flex w-full items-center justify-center gap-[10px] rounded-full py-[15px] text-[13px] font-semibold uppercase tracking-[0.08em] text-[#241c08] transition-transform duration-200',
              submitting ? 'cursor-wait opacity-90' : 'hover:-translate-y-[1px]',
            )}
          >
            {submitting ? (
              <>
                <span className="co-spinner" />
                {t('coPlacing')}
              </>
            ) : submitError ? (
              t('coRetry')
            ) : (
              t('placeOrder')
            )}
          </button>

          <Link to="/" className="mt-[12px] block text-center text-[12.5px] text-muted underline-offset-2 transition-colors hover:text-gold3 hover:underline">
            {t('coBackShop')}
          </Link>
        </div>
      </div>
    </section>
  )
}
