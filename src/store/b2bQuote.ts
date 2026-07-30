// Contract-price quote (Phase B). Asks the server (api/b2b-quote) for the
// reseller's goods total + payable amount. The server is the sole authority —
// prices are never sent from the browser. When contract is false (guest,
// non-reseller, expired, or any error) the cart/checkout render exactly as they
// do today. `pricingUnavailable` is a separate signal: a session cookie was
// present but contract pricing could not be applied (server misconfig or a
// stale/expired cookie) — the UI shows a calm notice, retail still renders.

import { create } from 'zustand'
import { useAuth } from './auth'

interface QuoteResponse {
  contract: boolean
  tier?: number
  goodsTotal?: number
  payable?: number
  contractPricingUnavailable?: boolean
}

interface B2BQuoteState {
  contract: boolean
  tier: number | null
  goodsTotal: number | null
  payable: number | null
  loading: boolean
  /** Cookie present but contract pricing couldn't be applied (misconfig/stale). */
  pricingUnavailable: boolean
  /** Debounced (~300ms). Call on cart open and whenever cart contents change. */
  refresh: (items: { id: string; qty: number }[]) => void
}

const DEBOUNCE_MS = 300
let timer: ReturnType<typeof setTimeout> | null = null
let seq = 0 // guards against out-of-order responses

const RETAIL = { contract: false, tier: null, goodsTotal: null, payable: null } as const

export const useB2BQuote = create<B2BQuoteState>((set) => ({
  contract: false,
  tier: null,
  goodsTotal: null,
  payable: null,
  loading: false,
  pricingUnavailable: false,

  refresh: (items) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(async () => {
      // Only active resellers get a contract quote. Guests / non-resellers /
      // expired never hit the endpoint, so their experience is byte-identical.
      const user = useAuth.getState().user
      if (user?.reseller.status !== 'active' || items.length === 0) {
        set({ ...RETAIL, loading: false, pricingUnavailable: false })
        return
      }

      const mySeq = ++seq
      set({ loading: true }) // keep previous figures visible — no spinner, no jump
      try {
        const res = await fetch('/api/b2b-quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(items.map((i) => ({ sku: i.id, qty: i.qty }))),
        })
        const data = (res.ok ? await res.json() : { contract: false }) as QuoteResponse
        if (mySeq !== seq) return // a newer request superseded this one
        if (data.contract && typeof data.goodsTotal === 'number' && typeof data.payable === 'number') {
          set({
            contract: true,
            tier: data.tier ?? null,
            goodsTotal: data.goodsTotal,
            payable: data.payable,
            loading: false,
            pricingUnavailable: false,
          })
        } else {
          set({ ...RETAIL, loading: false, pricingUnavailable: !!data.contractPricingUnavailable })
        }
      } catch {
        if (mySeq !== seq) return
        set({ ...RETAIL, loading: false, pricingUnavailable: false })
      }
    }, DEBOUNCE_MS)
  },
}))
