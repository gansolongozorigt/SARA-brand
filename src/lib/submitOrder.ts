// ============================================================================
// Swappable order-submission module.
//
// v1 (this file): relays each order to the shop by email via Web3Forms, so a
// real backend isn't required yet. Paste the shop's Web3Forms access key into
// WEB3FORMS_ACCESS_KEY below.
//
// LATER: this whole module will be swapped to create a real WooCommerce order
// (POST {API_BASE}/wp-json/wc/store/v1/...). Keep the `Order` object SHAPE
// STABLE — only the body of submitOrder() should change when that happens, so
// the checkout UI never has to be touched again.
// ============================================================================

export const WEB3FORMS_ACCESS_KEY = 'PASTE_WEB3FORMS_KEY_HERE'

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

export type PaymentMethod = 'bank' | 'cod'

/** One ordered line. Numeric prices in MNT — stable for the WooCommerce swap. */
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

/** The stable order shape passed to submitOrder(). Do not reshape lightly. */
export interface Order {
  customer: OrderCustomer
  payment: PaymentMethod
  items: OrderItem[]
  total: number
  /** Currency unit label for human-readable output ("₮" or "MNT"). */
  currencyLabel: string
}

export interface SubmitResult {
  ok: boolean
  error?: string
}

function money(n: number, label: string): string {
  const num = n.toLocaleString('en-US')
  return label === '₮' ? `${num}₮` : `${num} ${label}`
}

/** Build the readable text body that lands in the shop's inbox. */
function buildMessage(order: Order): string {
  const { customer: c, payment, items, total, currencyLabel } = order
  const lines: string[] = []

  lines.push('NEW ORDER — SARA')
  lines.push('========================')
  lines.push('')
  lines.push('CUSTOMER')
  lines.push(`  Name    : ${c.fullName}`)
  lines.push(`  Phone   : ${c.phone}`)
  lines.push(`  City    : ${c.city}`)
  lines.push(`  Address : ${c.address}`)
  if (c.email) lines.push(`  Email   : ${c.email}`)
  if (c.note) lines.push(`  Note    : ${c.note}`)
  lines.push('')
  lines.push(`PAYMENT : ${payment === 'bank' ? 'Bank transfer' : 'Cash on delivery (COD)'}`)
  lines.push('')
  lines.push('ITEMS')
  for (const it of items) {
    lines.push(
      `  • ${it.name} × ${it.qty}  —  ${money(it.unitPrice, currencyLabel)} ea  =  ${money(it.lineTotal, currencyLabel)}`,
    )
  }
  lines.push('')
  lines.push(`GRAND TOTAL : ${money(total, currencyLabel)}`)

  return lines.join('\n')
}

/**
 * Submit an order. Returns { ok } — never throws; network/HTTP failures resolve
 * to { ok:false, error } so the UI can show a retry.
 */
export async function submitOrder(order: Order): Promise<SubmitResult> {
  try {
    const res = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: 'SARA - new order',
        from_name: 'SARA storefront',
        // Handy top-level fields (also visible in the Web3Forms dashboard):
        name: order.customer.fullName,
        phone: order.customer.phone,
        email: order.customer.email || 'no-reply@sarabrand.mn',
        message: buildMessage(order),
      }),
    })

    const data = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null

    if (res.ok && data?.success) return { ok: true }
    return { ok: false, error: data?.message || `HTTP ${res.status}` }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' }
  }
}
