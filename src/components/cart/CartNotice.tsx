import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from '../../store/cart'
import { useT } from '../../i18n/LanguageContext'

/**
 * One calm, premium notice shown when the cart self-healed on hydration (a stale
 * item was silently removed). Soft ivory pill, muted text, no red, no raw ids —
 * auto-dismisses after a few seconds.
 */
export default function CartNotice() {
  const t = useT()
  const staleRemoved = useCart((s) => s.staleRemoved)
  const clearStaleNotice = useCart((s) => s.clearStaleNotice)

  useEffect(() => {
    if (!staleRemoved) return
    const id = window.setTimeout(() => clearStaleNotice(), 6000)
    return () => window.clearTimeout(id)
  }, [staleRemoved, clearStaleNotice])

  return (
    <AnimatePresence>
      {staleRemoved && (
        <motion.div
          role="status"
          className="pointer-events-none fixed inset-x-0 bottom-[24px] z-[220] flex justify-center px-[16px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="max-w-[440px] rounded-full border border-line bg-ivory/95 px-[22px] py-[12px] text-center text-[13px] leading-snug text-ink shadow-[0_14px_40px_-18px_rgba(60,46,12,0.5)] backdrop-blur-[6px]">
            {t('cartItemRemoved')}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
