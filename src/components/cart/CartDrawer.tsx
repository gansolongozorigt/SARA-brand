import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart, selectSubtotal } from '../../store/cart'
import { PRODUCTS } from '../../data/products'
import { useLang, useT } from '../../i18n/LanguageContext'
import Price from '../ui/Price'

export default function CartDrawer() {
  const t = useT()
  const { lang } = useLang()
  const navigate = useNavigate()
  const isOpen = useCart((s) => s.isOpen)
  const closeCart = useCart((s) => s.closeCart)
  const items = useCart((s) => s.items)
  const setQty = useCart((s) => s.setQty)
  const removeItem = useCart((s) => s.removeItem)
  const subtotal = useCart(selectSubtotal)

  // Escape to close + lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeCart])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200]">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[rgba(30,24,12,0.45)] backdrop-blur-[2px]"
            onClick={closeCart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          {/* Panel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={t('cartTitle')}
            className="absolute right-0 top-0 flex h-full w-[min(400px,92vw)] flex-col bg-ivory shadow-[0_0_60px_-10px_rgba(40,30,8,0.55)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {/* Header row — title left, close pinned right, both vertically centered */}
            <div className="flex items-center justify-between gap-[12px] border-b border-line px-[24px] py-[18px]">
              <h2 className="font-serif text-[22px] font-semibold text-ink">{t('cartTitle')}</h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label={t('close')}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full leading-none text-muted transition-colors hover:bg-cream hover:text-ink"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.6}>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Items / empty state */}
            <div className="flex-1 overflow-y-auto px-[24px]">
              {items.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-center text-[14px] text-muted">{t('emptyCart')}</p>
                </div>
              ) : (
                items.map((it) => {
                  const product = PRODUCTS.find((p) => p.id === it.id)
                  if (!product) return null
                  return (
                    <div key={it.id} className="flex gap-[14px] border-b border-line py-[16px]">
                      <img
                        src={product.image}
                        alt={product.name[lang]}
                        className="h-[76px] w-[64px] shrink-0 rounded-[10px] object-cover"
                      />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="cart-name font-serif text-[15px] leading-tight text-ink">{product.name[lang]}</div>
                        <div className="mt-[2px] text-[13px] font-medium text-gold3"><Price amount={product.price} /></div>
                        <div className="mt-auto flex items-center justify-between pt-[10px]">
                          {/* Quantity stepper — small square buttons, glyph centered, one row */}
                          <div className="inline-flex items-center rounded-full border border-line bg-paper">
                            <button
                              type="button"
                              aria-label="decrease quantity"
                              onClick={() => setQty(it.id, it.qty - 1)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[15px] leading-none text-gold3 transition-colors hover:text-ink"
                            >
                              −
                            </button>
                            <span className="inline-flex h-7 min-w-[26px] items-center justify-center text-[13px] font-medium leading-none text-ink">
                              {it.qty}
                            </span>
                            <button
                              type="button"
                              aria-label="increase quantity"
                              onClick={() => setQty(it.id, it.qty + 1)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[15px] leading-none text-gold3 transition-colors hover:text-ink"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(it.id)}
                            className="text-[12px] text-muted underline-offset-2 transition-colors hover:text-gold3 hover:underline"
                          >
                            {t('remove')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer: subtotal + checkout */}
            {items.length > 0 && (
              <div className="border-t border-line px-[24px] py-[18px]">
                <div className="flex items-center justify-between pb-[14px]">
                  <span className="text-[13px] uppercase tracking-[0.1em] text-muted">{t('subtotal')}</span>
                  <span className="font-serif text-[20px] font-semibold text-ink"><Price amount={subtotal} /></span>
                </div>
                {/* Checkout — close the drawer and go to the checkout route */}
                <button
                  type="button"
                  onClick={() => {
                    closeCart()
                    navigate('/checkout')
                  }}
                  className="gold-bg w-full rounded-full py-[13px] text-[13px] font-semibold uppercase tracking-[0.06em] text-[#241c08] transition-transform duration-200 hover:-translate-y-[1px]"
                >
                  {t('checkout')}
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
