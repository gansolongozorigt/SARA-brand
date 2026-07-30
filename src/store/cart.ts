import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PRODUCTS } from '../data/products'

export interface CartItem {
  id: string
  qty: number
}

// Known product-id migrations (old persisted id → current id). The demo catalog
// was replaced wholesale in commit 535ad93; the only demo id with evidence of
// living in real customers' carts is 'giftset', which is the same product now
// called 'skin_set' (Plant Polypeptide brightening 5-step set — confirmed by the
// demo entry's content and by real order #101). Everything else unresolvable is
// dropped rather than guessed.
const ID_MIGRATIONS: Record<string, string> = {
  giftset: 'skin_set',
}

const VALID_IDS = new Set(PRODUCTS.map((p) => p.id))

/**
 * Remap known old ids to current ones, drop anything that still doesn't resolve
 * in products.ts, and drop entries with a missing/invalid qty. `removed` lists
 * ids that were DROPPED (not remapped) — used to decide the "item removed" notice.
 */
function normalizeItems(raw: unknown): { items: CartItem[]; removed: string[] } {
  const items: CartItem[] = []
  const removed: string[] = []
  for (const entry of Array.isArray(raw) ? raw : []) {
    if (!entry || typeof entry !== 'object') {
      removed.push('(malformed)')
      continue
    }
    const e = entry as { id?: unknown; qty?: unknown }
    const rawId = typeof e.id === 'string' ? e.id : ''
    const id = ID_MIGRATIONS[rawId] ?? rawId
    const qty = Number(e.qty)
    if (!id || !VALID_IDS.has(id)) {
      if (rawId) removed.push(rawId)
      continue
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      removed.push(rawId || id)
      continue
    }
    // A migration may collide with an already-present id → merge quantities.
    const existing = items.find((i) => i.id === id)
    if (existing) existing.qty += qty
    else items.push({ id, qty })
  }
  return { items, removed }
}

// Carries "items were dropped during migrate" across to the rehydrate callback so
// the notice fires even when migrate (not hydration) did the removal.
let staleNoticePending = false

interface CartState {
  items: CartItem[]
  isOpen: boolean
  /** Transient (never persisted): true when hydration/migration dropped items. */
  staleRemoved: boolean
  addItem: (id: string, qty?: number) => void
  removeItem: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  clearStaleNotice: () => void
  openCart: () => void
  closeCart: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      staleRemoved: false,
      addItem: (id, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === id)
          return existing
            ? { items: s.items.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i)) }
            : { items: [...s.items, { id, qty }] }
        }),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((s) =>
          qty <= 0
            ? { items: s.items.filter((i) => i.id !== id) }
            : { items: s.items.map((i) => (i.id === id ? { ...i, qty } : i)) },
        ),
      clear: () => set({ items: [] }),
      clearStaleNotice: () => set({ staleRemoved: false }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'sara-cart',
      version: 1,
      // Persist only the items — the drawer always starts closed on reload.
      partialize: (s) => ({ items: s.items }),
      // Runs when the stored version < current: remap/drop stale entries.
      migrate: (persisted) => {
        const { items, removed } = normalizeItems((persisted as { items?: unknown } | null)?.items)
        if (removed.length) {
          console.warn('[cart] migrate dropped stale entries:', removed)
          staleNoticePending = true
        }
        return { items }
      },
      // Self-healing: validate against products.ts on every hydration.
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const { items, removed } = normalizeItems(state.items)
        if (removed.length) {
          console.warn('[cart] hydration removed unresolvable entries:', removed)
          state.items = items
          staleNoticePending = true
        }
        if (staleNoticePending) {
          state.staleRemoved = true
          staleNoticePending = false
        }
      },
    },
  ),
)

/**
 * Total item count for the header badge — counts only items that RESOLVE in
 * products.ts, the same list the cart page renders. A badge count can therefore
 * never exist for an item the page cannot display.
 */
export const selectCount = (s: CartState): number =>
  s.items.reduce((n, i) => (VALID_IDS.has(i.id) ? n + i.qty : n), 0)

/** Whether the cart has at least one RESOLVABLE item (for enabling checkout). */
export const selectHasResolvedItems = (s: CartState): boolean => s.items.some((i) => VALID_IDS.has(i.id))

// Subtotal now lives in ../store/livePrices as `useLiveSubtotal(items)` so it can
// merge live WooCommerce prices over the static catalogue (with static fallback).
