import { useCallback, useEffect, useState } from 'react'
import { cn } from '../../lib/utils'
import { HERO_PRODUCTS, MOODS } from '../../data/heroProducts'
import { useLang, useT } from '../../i18n/LanguageContext'
import Price from '../ui/Price'
import { useProductModal } from '../../store/productModal'

const AUTO_ADVANCE_MS = 4200

export default function Coverflow() {
  const t = useT()
  const { lang } = useLang()
  const openModal = useProductModal((s) => s.open)
  const n = HERO_PRODUCTS.length
  const [cfIndex, setCfIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const cfMove = useCallback((dir: number) => {
    setCfIndex((i) => (i + dir + n) % n)
  }, [n])

  // Auto-advance, paused while hovering the stage.
  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => cfMove(1), AUTO_ADVANCE_MS)
    return () => window.clearInterval(id)
  }, [paused, cfMove])

  // Shift the ambient orb mood to match the active card.
  useEffect(() => {
    const [m1, m2] = MOODS[HERO_PRODUCTS[cfIndex].mood]
    document.documentElement.style.setProperty('--m1', m1)
    document.documentElement.style.setProperty('--m2', m2)
  }, [cfIndex])

  return (
    <div className="stage" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="coverflow">
        {HERO_PRODUCTS.map((p, i) => {
          let diff = i - cfIndex
          if (diff > n / 2) diff -= n
          if (diff < -n / 2) diff += n
          const abs = Math.abs(diff)
          const isActive = abs === 0
          return (
            <div
              key={p.id}
              className={cn('cf-item', isActive && 'active')}
              style={{
                transform: `translateX(${diff * 150}px) translateZ(${isActive ? 0 : -260}px) rotateY(${diff * -34}deg) scale(${isActive ? 1 : 0.82})`,
                opacity: abs > 2 ? 0 : 1,
                zIndex: 10 - abs,
                pointerEvents: abs > 2 ? 'none' : 'auto',
              }}
              onClick={() => {
                // Active card opens its detail modal; side cards rotate to center.
                if (isActive) openModal(p.id)
                else setCfIndex(i)
              }}
            >
              <img src={p.image} alt={p.name[lang]} />
              <div className="glow" />
              <div className="cf-cap">
                <h4>{p.name[lang].split(' ').slice(0, 3).join(' ')}</h4>
                <div className="pr"><Price amount={p.price} /></div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="cf-tip">{t('cfTip')}</div>

      <div className="cf-arrows">
        <button type="button" aria-label="previous" onClick={() => cfMove(-1)}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={2}>
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button type="button" aria-label="next" onClick={() => cfMove(1)}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={2}>
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
