import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { PRODUCTS } from '../../data/products'
import { useProductModal } from '../../store/productModal'
import { useCart } from '../../store/cart'
import { useLang, useT } from '../../i18n/LanguageContext'
import { useFormatPrice } from '../../lib/useFormatPrice'

export default function ProductModal() {
  const t = useT()
  const { lang } = useLang()
  const fmt = useFormatPrice()
  const productId = useProductModal((s) => s.productId)
  const close = useProductModal((s) => s.close)
  const addItem = useCart((s) => s.addItem)

  const product = productId ? PRODUCTS.find((p) => p.id === productId) ?? null : null

  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const timer = useRef<number | null>(null)

  // Reset the quantity each time a new product opens.
  useEffect(() => {
    setQty(1)
  }, [productId])

  // Escape closes; lock body scroll while open.
  useEffect(() => {
    if (!productId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [productId, close])

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!product) return
    addItem(product.id, qty)
    setAdded(true)
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 1400)
  }

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          key="product-modal"
          className="fixed inset-0 z-[150] flex items-center justify-center p-[20px] max-[680px]:p-[12px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[rgba(30,24,12,0.5)] backdrop-blur-[6px]"
            onClick={close}
          />

          {/* Sheet */}
          <motion.div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={product.name[lang]}
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.42, ease: [0.2, 0.9, 0.3, 1.2] }}
          >
            <button type="button" className="mclose" onClick={close} aria-label={t('close')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div className="imgcol">
              <img src={product.image} alt={product.name[lang]} />
            </div>

            <div className="info">
              <div className="k">{product.tag[lang]}</div>
              <h2>{product.name[lang]}</h2>
              <div className="stagline">{product.short[lang]}</div>
              <div className="desc">{product.desc[lang]}</div>
              <ul className="specs">
                {product.specs[lang].map((spec, i) => (
                  <li key={i}>{spec}</li>
                ))}
              </ul>

              <div className="buyrow">
                <div className="pricebig">
                  <span className="p">{fmt(product.price)}</span>
                  {product.old != null && <span className="o">{fmt(product.old)}</span>}
                </div>
                <div className="qty">
                  <button type="button" aria-label="decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    −
                  </button>
                  <span>{qty}</span>
                  <button type="button" aria-label="increase quantity" onClick={() => setQty((q) => q + 1)}>
                    +
                  </button>
                </div>
              </div>

              <div className="mt-[16px]">
                <button type="button" className={cn('atc', added && 'added')} onClick={handleAdd}>
                  <span className="cartfly">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.7}>
                      <path d="M6 6h15l-1.5 9h-12z" />
                    </svg>
                  </span>
                  <span className="lbl">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                      <path d="M6 6h15l-1.5 9h-12z" />
                      <circle cx="9" cy="20" r="1.4" />
                      <circle cx="18" cy="20" r="1.4" />
                    </svg>
                    {t('addCart')}
                  </span>
                  <span className="done">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2}>
                      <path d="M5 12l5 5L20 6" />
                    </svg>
                    {t('added')}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
