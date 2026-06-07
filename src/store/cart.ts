import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PRODUCTS } from '../data/products'

export interface CartItem {
  id: string
  qty: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (id: string) => void
  removeItem: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  openCart: () => void
  closeCart: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (id) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === id)
          return existing
            ? { items: s.items.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)) }
            : { items: [...s.items, { id, qty: 1 }] }
        }),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((s) =>
          qty <= 0
            ? { items: s.items.filter((i) => i.id !== id) }
            : { items: s.items.map((i) => (i.id === id ? { ...i, qty } : i)) },
        ),
      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'sara-cart',
      // Persist only the items — the drawer always starts closed on reload.
      partialize: (s) => ({ items: s.items }),
    },
  ),
)

/** Total number of items (summed quantity) — for the header badge. */
export const selectCount = (s: CartState): number => s.items.reduce((n, i) => n + i.qty, 0)

/** Subtotal in MNT — unit price looked up from PRODUCTS by id. */
export const selectSubtotal = (s: CartState): number =>
  s.items.reduce((sum, i) => {
    const product = PRODUCTS.find((p) => p.id === i.id)
    return sum + (product ? product.price * i.qty : 0)
  }, 0)
