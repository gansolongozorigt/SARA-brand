import { Link } from 'react-router-dom'
import { useT } from '../../i18n/LanguageContext'
import type { TranslationKey } from '../../i18n'

const EXPLORE: { key: TranslationKey; to: string }[] = [
  { key: 'navProducts', to: '/' },
  { key: 'navAbout', to: '/about' },
  { key: 'navContact', to: '/contact' },
]

export default function Footer() {
  const t = useT()
  return (
    <footer className="bg-ink px-[26px] pb-[28px] pt-[54px] text-[#cfc6b4] max-[680px]:px-[22px] max-[680px]:pb-[24px] max-[680px]:pt-[40px]">
      <div className="mx-auto grid max-w-[1240px] grid-cols-[1.4fr_1fr_1fr] gap-[34px] max-[980px]:grid-cols-2 max-[680px]:grid-cols-1 max-[680px]:gap-[24px]">
        {/* Brand + blurb — the SARA logo is gold on every background */}
        <div>
          <Link
            to="/"
            className="gold-text mb-[14px] inline-block pl-[0.42em] font-serif text-[34px] font-semibold tracking-[0.42em] max-[680px]:text-[28px]"
          >
            SARA
          </Link>
          <p className="max-w-[320px] text-[14px] text-[#9c9483] max-[680px]:text-[13px]">{t('footAbout')}</p>
        </div>

        {/* Explore */}
        <div>
          <h5 className="mb-[14px] font-sans text-[12px] uppercase tracking-[0.18em] text-gold2">{t('footExplore')}</h5>
          <ul className="flex flex-col gap-[9px]">
            {EXPLORE.map(({ key, to }) => (
              <li key={key}>
                <Link
                  to={to}
                  className="text-[14px] text-[#b8af9c] transition-colors duration-[250ms] hover:text-white"
                >
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h5 className="mb-[14px] font-sans text-[12px] uppercase tracking-[0.18em] text-gold2">{t('footContact')}</h5>
          <ul className="flex flex-col gap-[9px]">
            <li className="text-[14px] text-[#b8af9c] transition-colors duration-[250ms] hover:text-white">
              <a href="tel:+97689983612">+976 8998 3612</a>
            </li>
            <li className="text-[14px] text-[#b8af9c]">{t('footHours')}</li>
            <li className="cursor-pointer text-[14px] text-[#b8af9c] transition-colors duration-[250ms] hover:text-white">
              Instagram · Facebook
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto mt-[34px] flex max-w-[1240px] flex-wrap justify-between gap-[10px] border-t border-white/10 pt-[20px] text-[12.5px] text-[#8a8270]">
        <span>
          © 2026 SARA. <span>{t('footRights')}</span>
        </span>
        <span>{t('footMade')}</span>
      </div>
    </footer>
  )
}
