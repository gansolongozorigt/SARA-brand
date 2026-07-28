// Contract-price quote (Phase B). Asks the server (api/b2b-quote) for the
// reseller's goods total + payable amount. The server is the sole authority —
// prices are never sent from the browser. When contract is false (guest,
// non-reseller, expired, empty cart, or any error) the cart/checkout render
// exactly as they do today.

import { create } from 'zustand'
import { useAuth } from './auth'

interface QuoteResponse {
  contract: boolean
  tier?: number
  goodsTotal?: number
  payable?: number
}

interface B2BQuoteState {
  contract: boolean
  tier: number | null
  goodsTotal: number | null
  payable: number | null
  loading: boolean
  /** Debounced (~300ms). Call on cart open and whenever cart contents change. */
  refresh: (items: { id: string; qty: number }[]) => void
}

const DEBOUNCE_MS = 300
let timer: ReturnType<typeof setTimeout> | null = null
let seq = 0 // guards against out-of-order responses

export const useB2BQuote = create<B2BQuoteState>((set) => ({
  contract: false,
  tier: null,
  goodsTotal: null,
  payable: null,
  loading: false,

  refresh: (items) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(async () => {
      // Only active resellers get a contract quote. Guests / non-resellers /
      // expired never hit the endpoint, so their experience is byte-identical.
      const user = useAuth.getState().user
      if (user?.reseller.status !== 'active' || items.length === 0) {
        set({ contract: false, tier: null, goodsTotal: null, payable: null, loading: false })
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
          })
        } else {
          set({ contract: false, tier: null, goodsTotal: null, payable: null, loading: false })
        }
      } catch {
        if (mySeq !== seq) return
        set({ contract: false, tier: null, goodsTotal: null, payable: null, loading: false })
      }
    }, DEBOUNCE_MS)
  },
}))
