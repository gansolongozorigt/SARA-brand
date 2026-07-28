// ============================================================================
// Order types shared by the checkout UI and the confirmation screen.
//
// Phase C: order submission moved SERVER-SIDE to api/order-submit.ts, which
// creates a real WooCommerce order and emails the shop using server-computed
// prices. The browser no longer talks to Web3Forms for orders. This module now
// only holds the order SHAPE used to render the confirmation screen.
// (The contact form still uses its own client-side Web3Forms path — see
// submitContact.ts — which is unrelated to orders.)
// ============================================================================

export type PaymentMethod = 'bank' | 'cod'

/** One ordered line (for the confirmation display). Numeric prices in MNT. */
export interface OrderItem {
  id: string
  name: string // localized product name, snapshotted at order time
  qty: number
  unitPrice: number
  lineTotal: number
}

export interface OrderCustomer {
  fullName: string
  phone: string
  city: string
  address: string
  email?: string
  note?: string
}

/**
 * Contract-order info (reseller). All values are SERVER-COMPUTED (returned by
 * api/order-submit) — authoritative, not client-derived.
 */
export interface OrderContract {
  resellerEmail: string
  tier: number
  goodsTotal: number
  payable: number
}

/** The order snapshot rendered on the confirmation screen. */
export interface Order {
  customer: OrderCustomer
  payment: PaymentMethod
  items: OrderItem[]
  total: number
  /** Currency unit label for human-readable output ("₮" or "MNT"). */
  currencyLabel: string
  /** Present only for contract (reseller) orders. */
  contract?: OrderContract
  /** WooCommerce order number, from the server on success. */
  orderNumber?: string
}
