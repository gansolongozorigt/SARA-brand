import { cn } from '../../lib/utils'
import { useB2BQuote } from '../../store/b2bQuote'
import { useT } from '../../i18n/LanguageContext'

/**
 * Calm inline notice shown in the cart and checkout when a session cookie was
 * present but contract pricing could not be applied (server misconfig or a
 * stale/expired cookie). Soft ivory, no red, no code — retail still renders.
 * Renders nothing otherwise (guests, and genuinely-expired contracts).
 */
export default function ContractPricingNotice({ className }: { className?: string }) {
  const t = useT()
  const pricingUnavailable = useB2BQuote((s) => s.pricingUnavailable)
  if (!pricingUnavailable) return null
  return (
    <div
      role="status"
      className={cn(
        'rounded-[14px] border border-line bg-ivory/95 px-[16px] py-[10px] text-center text-[12.5px] leading-snug text-ink',
        className,
      )}
    >
      {t('contractPricingUnavailable')}
    </div>
  )
}
