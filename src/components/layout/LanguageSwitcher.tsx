import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { useLang } from '../../i18n/LanguageContext'
import { LANGUAGES } from '../../i18n'

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0]

  // Close on outside click / Escape while open.
  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      {/* Trigger — 44px circle matching the account/cart buttons, showing the current code */}
      <button
        type="button"
        aria-label="Select language"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="cartbtn"
      >
        <span className="text-[13px] font-medium leading-none tracking-tight text-gold3">{current.short}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Language"
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.17, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 top-[calc(100%+10px)] z-[100] w-[180px] rounded-[16px] border border-line bg-ivory p-[6px] shadow-[0_18px_44px_-16px_rgba(60,46,12,0.45)]"
          >
            {LANGUAGES.map((l) => {
              const isActive = l.code === lang
              return (
                <li key={l.code} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    onClick={() => {
                      setLang(l.code)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-[12px] rounded-[10px] px-[12px] py-[8px] text-left transition-colors duration-200',
                      isActive ? 'gold-bg' : 'hover:bg-cream',
                    )}
                  >
                    <span
                      className={cn(
                        'w-[26px] shrink-0 text-[12px] font-medium tracking-tight',
                        isActive ? 'text-[#241c08]' : 'text-gold3',
                      )}
                    >
                      {l.short}
                    </span>
                    <span className={cn('text-[13.5px]', isActive ? 'font-medium text-[#241c08]' : 'text-charcoal')}>
                      {l.native}
                    </span>
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
