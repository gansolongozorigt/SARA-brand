import { Link } from 'react-router-dom'
import { useT } from '../../i18n/LanguageContext'
import { cn } from '../../lib/utils'

/**
 * Small muted consent line shown above the checkout place-order button and under
 * the contact form. The localized `consentText` marks the clickable privacy-policy
 * phrase with [[...]]; it renders as a link to /privacy that opens in a NEW TAB so
 * the customer's filled-in form is never lost.
 */
export default function ConsentNotice({ className }: { className?: string }) {
  const t = useT()
  const raw = t('consentText')
  const m = raw.match(/^([\s\S]*)\[\[([\s\S]*)\]\]([\s\S]*)$/)
  const [before, linkText, after] = m ? [m[1], m[2], m[3]] : [raw, '', '']
  return (
    <p className={cn('text-[12px] leading-[1.6] text-muted', className)}>
      {before}
      {linkText && (
        <Link
          to="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold3 underline underline-offset-2 transition-colors hover:text-ink"
        >
          {linkText}
        </Link>
      )}
      {after}
    </p>
  )
}
