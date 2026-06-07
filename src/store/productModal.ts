import { create } from 'zustand'

interface ProductModalState {
  productId: string | null
  open: (id: string) => void
  close: () => void
}

/** Which product's detail modal is open (null = closed). */
export const useProductModal = create<ProductModalState>((set) => ({
  productId: null,
  open: (id) => set({ productId: id }),
  close: () => set({ productId: null }),
}))
