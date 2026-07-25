// Zustand slice that holds the live price/stock overlay fetched once from the
// WooCommerce read proxy, plus hooks/selectors that merge it over the static
// catalogue. The static products render immediately; when the fetch resolves the
// merged values update in place. Any failure leaves `overlays` empty, so every
// consumer transparently falls back to the static products.ts values.

import { useMemo } from 'react'
import { create } from 'zustand'
import { PRODUCTS, type Product } from '../data/products'
import { fetchLiveOverlays, type OverlayMap, type WooStockStatus } from '../lib/wooPrices'

/**
 * Whether a live stock status should block purchase. Only an explicit
 * "outofstock" blocks — "instock", "onbackorder", and missing/unknown (fetch
 * failed or no Woo match) are all treated as available, so a data gap never
 * blocks a sale.
 */
export function isSoldOut(status: WooStockStatus | undefined): boolean {
  return status === 'outofstock'
}

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

interface LivePricesState {
  overlays: OverlayMap
  status: LoadStatus
  /** Fetch overlays once (guarded); safe to call from React StrictMode double-mount. */
  load: () => Promise<void>
}

export const useLivePrices = create<LivePricesState>((set, get) => ({
  overlays: {},
  status: 'idle',
  load: async () => {
    if (get().status !== 'idle') return // fetch exactly once per session
    set({ status: 'loading' })
    try {
      const overlays = await fetchLiveOverlays()
      set({ overlays, status: 'ready' })
    } catch (err) {
      // Silent, non-blocking: keep static prices. Console only, per requirements.
      console.warn('[livePrices] falling back to static prices —', (err as Error).message)
      set({ status: 'error' })
    }
  },
}))

/**
 * Merge a SKU's live overlay over a static product. WooCommerce owns pricing +
 * sale state + stock: a matched overlay REPLACES `old` (so a product no longer on
 * sale in Woo loses its strike-through). No match → the static product is returned
 * untouched.
 */
export function applyOverlay(product: Product, overlays: OverlayMap): Product {
  const overlay = overlays[product.id]
  if (!overlay) return product
  return {
    ...product,
    price: overlay.price,
    old: overlay.old,
    stockStatus: overlay.stockStatus,
  }
}

/** The full catalogue with live prices/stock merged in (memoized on overlays). */
export function useLiveProducts(): Product[] {
  const overlays = useLivePrices((s) => s.overlays)
  return useMemo(() => PRODUCTS.map((p) => applyOverlay(p, overlays)), [overlays])
}

/** A single merged product by id, or null. */
export function useLiveProduct(id: string | null): Product | null {
  const overlays = useLivePrices((s) => s.overlays)
  return useMemo(() => {
    if (!id) return null
    const product = PRODUCTS.find((p) => p.id === id)
    return product ? applyOverlay(product, overlays) : null
  }, [id, overlays])
}

/**
 * Cart subtotal in MNT using live prices, reactive to BOTH the cart items and the
 * live overlays. Unit price falls back to the static price when a SKU has no
 * overlay. Out-of-stock lines are excluded from the total (they can't be ordered
 * until removed). Kept here as the single subtotal source.
 */
export function useLiveSubtotal(items: { id: string; qty: number }[]): number {
  const overlays = useLivePrices((s) => s.overlays)
  return useMemo(
    () =>
      items.reduce((sum, item) => {
        const product = PRODUCTS.find((p) => p.id === item.id)
        if (!product) return sum
        if (isSoldOut(overlays[item.id]?.stockStatus)) return sum
        const price = overlays[item.id]?.price ?? product.price
        return sum + price * item.qty
      }, 0),
    [items, overlays],
  )
}

/** Reactive set of cart-item ids that are currently out of stock (live). */
export function useOutOfStockIds(items: { id: string }[]): Set<string> {
  const overlays = useLivePrices((s) => s.overlays)
  return useMemo(
    () => new Set(items.filter((i) => isSoldOut(overlays[i.id]?.stockStatus)).map((i) => i.id)),
    [items, overlays],
  )
}
