import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { useLang, useT } from '../../i18n/LanguageContext'
import type { TranslationKey } from '../../i18n'
import { useCart, selectCount } from '../../store/cart'
import LanguageSwitcher from './LanguageSwitcher'

// Products scrolls to the home shop section; About/Contact are their own routes.
const NAV_LINKS: { id: string; key: TranslationKey; to: string; hash?: string }[] = [
  { id: 'products', key: 'navProducts', to: '/', hash: 'products' },
  { id: 'about', key: 'navAbout', to: '/about' },
  { id: 'contact', key: 'navContact', to: '/contact' },
]

const ANN_KEYS: TranslationKey[] = ['ann1', 'ann2', 'ann3']

export default function Header() {
  const t = useT()
  const { lang } = useLang()
  const location = useLocation()
  const cartCount = useCart(selectCount)
  const openCart = useCart((s) => s.openCart)

  const [scrolled, setScrolled] = useState(false)
  const [activeNav, setActiveNav] = useState<string>('products')
  const [mobOpen, setMobOpen] = useState(false)
  const [pill, setPill] = useState({ width: 0, x: 0, opacity: 0 })

  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

  // Keep the active nav item in sync with the current route.
  useEffect(() => {
    const p = location.pathname
    setActiveNav(p === '/about' ? 'about' : p === '/contact' ? 'contact' : 'products')
  }, [location.pathname])

  // Position the sliding pill under a given nav link.
  const movePill = useCallback((id: string) => {
    const el = linkRefs.current[id]
    if (!el) return
    setPill({ width: el.offsetWidth, x: el.offsetLeft, opacity: 1 })
  }, [])

  // Keep the pill under the active link, and reflow on resize / font load / language change.
  useLayoutEffect(() => {
    movePill(activeNav)
  }, [activeNav, movePill, lang])

  useEffect(() => {
    const reflow = () => movePill(activeNav)
    document.fonts?.ready.then(reflow)
    window.addEventListener('resize', reflow)
    return () => window.removeEventListener('resize', reflow)
  }, [activeNav, movePill])

  // Translucent header gains a stronger background + shadow once scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Products: if already on home, smooth-scroll to the shop section.
  const onNavClick = (link: (typeof NAV_LINKS)[number]) => {
    setMobOpen(false)
    if (link.hash && location.pathname === '/') {
      document.getElementById(link.hash)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Top announcement bar */}
      <div className="relative h-[38px] overflow-hidden bg-forest text-center text-[12px] font-medium uppercase leading-[38px] tracking-[0.18em] text-[#eadfca] max-[680px]:text-[10px] max-[680px]:tracking-[0.05em]">
        {ANN_KEYS.map((key) => (
          <span key={key} className="ann-roll">
            {t(key)}
          </span>
        ))}
      </div>

      {/* Sticky nav — logo left, nav absolutely centered on the page, tools right */}
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-line backdrop-blur-[14px] transition-all duration-300',
          scrolled
            ? 'bg-[rgba(247,242,233,0.92)] shadow-[0_10px_30px_-22px_rgba(60,46,12,0.5)]'
            : 'bg-[rgba(247,242,233,0.72)]',
        )}
      >
        <div className="relative mx-auto flex max-w-[1240px] items-center justify-between gap-[20px] px-[26px] py-[14px] max-[680px]:px-[18px] max-[680px]:py-[12px]">
          {/* Brand — links home */}
          <Link
            to="/"
            className="pl-[0.42em] font-serif text-[30px] font-semibold tracking-[0.42em] max-[680px]:text-[22px] max-[680px]:tracking-[0.32em]"
          >
            <span className="gold-text">SARA</span>
          </Link>

          {/* Center nav links — absolutely centered relative to the page */}
          <nav
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-[6px] max-[680px]:hidden"
            onMouseLeave={() => movePill(activeNav)}
          >
            <span
              className="nav-pill"
              style={{
                width: pill.width,
                transform: `translateX(${pill.x}px)`,
                opacity: pill.opacity,
              }}
            />
            {NAV_LINKS.map((link) => (
              <Link
                key={link.id}
                to={link.to}
                ref={(el) => {
                  linkRefs.current[link.id] = el
                }}
                onMouseEnter={() => movePill(link.id)}
                onClick={() => onNavClick(link)}
                className={cn(
                  'relative z-[1] px-[18px] py-[9px] text-[13.5px] font-semibold uppercase tracking-[0.08em] transition-colors duration-300 hover:text-gold3',
                  activeNav === link.id ? 'text-gold3' : 'text-muted',
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          {/* Right tools */}
          <div className="flex items-center gap-[14px] max-[680px]:gap-[10px]">
            {/* Language switcher (compact code button + dropdown) */}
            <LanguageSwitcher />

            {/* Account (logged-out: icon only) */}
            <button type="button" aria-label="account" className="cartbtn acctbtn">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.7}>
                <circle cx="12" cy="8" r="3.4" />
                <path d="M5 20c1.2-3.6 4-5 7-5s5.8 1.4 7 5" />
              </svg>
            </button>

            {/* Cart — opens the drawer; badge shows total item count */}
            <button type="button" aria-label="cart" className="cartbtn" onClick={openCart}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.7}>
                <path d="M6 6h15l-1.5 9h-12z" />
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="18" cy="20" r="1.4" />
                <path d="M6 6 5 3H2" />
              </svg>
              <span className={cn('cartcount', cartCount > 0 && 'show')}>{cartCount}</span>
            </button>

            {/* Burger (mobile only) */}
            <button
              type="button"
              aria-label="menu"
              onClick={() => setMobOpen((o) => !o)}
              className="hidden w-[30px] flex-col gap-[5px] max-[680px]:flex"
            >
              <span className="h-[2px] rounded-[2px] bg-gold3 transition-all duration-300" />
              <span className="h-[2px] rounded-[2px] bg-gold3 transition-all duration-300" />
              <span className="h-[2px] rounded-[2px] bg-gold3 transition-all duration-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen mobile nav */}
      <div
        className={cn(
          'fixed inset-0 z-[60] flex-col gap-[6px] bg-ivory px-[28px] py-[80px]',
          mobOpen ? 'flex' : 'hidden',
        )}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.id}
            to={link.to}
            onClick={() => onNavClick(link)}
            className="border-b border-line py-[9px] font-serif text-[30px] font-semibold"
          >
            {t(link.key)}
          </Link>
        ))}
      </div>
    </>
  )
}
