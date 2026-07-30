import type { VercelRequest, VercelResponse } from '@vercel/node'
import { checkSession, clearSessionCookie } from './_authServer.js'
import { readReseller, statusFor, discountForTier, type Tier } from './_reseller.js'

/**
 * Server-side order submission (Phase C). Creates a REAL WooCommerce order with
 * status 'on-hold' (awaiting payment) — the pending→on-hold transition is what
 * fires WooCommerce's "New order" admin email. Prices, totals, tier and discount
 * are ALL computed here — the client sends only { items:[{sku,qty}], customer,
 * paymentMethod }, never money. Shop notification is handled by that WooCommerce
 * email (no third-party step — server-side Web3Forms is blocked by Cloudflare).
 *
 * Responses:
 *   { ok:true, orderNumber, goodsTotal, payable, contract, tier }
 *   { ok:false, error, items?/fields? } — unique codes:
 *     400 bad_body | no_items | missing_customer(+fields) | bad_email | bad_payment
 *         | unknown_sku(+items) | no_price(+items)
 *     409 out_of_stock(+items) · 502 session_unavailable | order_failed
 *
 * If order creation fails we return an error and the client must not show success.
 */
const MAX_QTY = 999
const MAX_ITEMS = 100

// ----- input hygiene -----

function clean(v: unknown, max: number): string {
  if (typeof v !== 'string') return ''
  // strip control characters (incl. newlines), trim, cap length
  // eslint-disable-next-line no-control-regex
  return v.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max)
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ----- WooCommerce price mirror (same selection as the storefront overlay) -----

function parsePrice(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : null
  if (typeof value !== 'string') return null
  const t = value.trim()
  if (t === '') return null
  const n = Number(t)
  return Number.isFinite(n) && n >= 0 ? n : null
}

interface WooRow {
  id?: unknown
  sku?: unknown
  price?: unknown
  regular_price?: unknown
  sale_price?: unknown
  stock_status?: unknown
}

interface PriceEntry {
  productId: number
  price: number | null
  outOfStock: boolean
}

function selectPrice(row: WooRow): PriceEntry | null {
  const productId = typeof row.id === 'number' ? row.id : Number(row.id)
  if (!Number.isInteger(productId) || productId <= 0) return null
  const regular = parsePrice(row.regular_price) ?? parsePrice(row.price)
  const sale = parsePrice(row.sale_price)
  let price: number | null
  if (sale != null && sale > 0 && (regular == null || sale < regular)) price = sale
  else price = regular ?? sale
  return { productId, price, outOfStock: row.stock_status === 'outofstock' }
}

function wcBase(): string {
  const url = process.env.WOO_API_URL
  if (!url) throw new Error('WOO_API_URL not set')
  const trimmed = url.replace(/\/+$/, '')
  return /\/wp-json\/wc\/v\d/.test(trimmed) ? trimmed : `${trimmed}/wp-json/wc/v3`
}

/** Read prices/stock with the READ key (least privilege for the read path). */
async function fetchWooPrices(): Promise<Map<string, PriceEntry>> {
  const key = process.env.WOO_CONSUMER_KEY
  const secret = process.env.WOO_CONSUMER_SECRET
  if (!key || !secret) throw new Error('WOO read creds not set')
  const url = `${wcBase()}/products?per_page=100&consumer_key=${encodeURIComponent(key)}&consumer_secret=${encodeURIComponent(secret)}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`woo read ${res.status}`)
  const rows = (await res.json()) as WooRow[]
  const map = new Map<string, PriceEntry>()
  for (const r of Array.isArray(rows) ? rows : []) {
    if (r && typeof r.sku === 'string' && r.sku) {
      const entry = selectPrice(r)
      if (entry) map.set(r.sku, entry)
    }
  }
  return map
}

// ----- WooCommerce order create (WRITE key only) -----

interface WooLineItem {
  product_id: number
  quantity: number
  subtotal: string
  total: string
}

async function createWooOrder(order: Record<string, unknown>): Promise<{ number: string; id: number }> {
  const key = process.env.WOO_WRITE_KEY
  const secret = process.env.WOO_WRITE_SECRET
  if (!key || !secret) throw new Error('WOO_WRITE_KEY/SECRET not set')
  const url = `${wcBase()}/orders?consumer_key=${encodeURIComponent(key)}&consumer_secret=${encodeURIComponent(secret)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(order),
  })
  const rawBody = await res.text().catch(() => '')
  if (!res.ok) {
    // Log WooCommerce's own error body ({code,message,data}) so a failure is never
    // opaque again — never the URL or credentials.
    console.error(`[order-submit] woo order create ${res.status}:`, rawBody.slice(0, 500))
    throw new Error(`woo order create ${res.status}`)
  }
  const data = JSON.parse(rawBody || '{}') as { id?: number; number?: string }
  if (!data.id) throw new Error('woo order create: no id')
  return { number: String(data.number ?? data.id), id: data.id }
}

// ----- handler -----

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Parse + validate input. Never accept prices/totals/tier from the client.
  const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) as
    | { items?: unknown; customer?: unknown; paymentMethod?: unknown }
    | null
  // Each early return carries a UNIQUE error code and a server-side log line
  // (field names / SKUs / counts only — never customer data, never secrets).
  if (!body || typeof body !== 'object') {
    console.error('order-submit reject:', 'bad_body')
    return res.status(400).json({ ok: false, error: 'bad_body' })
  }

  const rawItems = Array.isArray(body.items) ? body.items : []
  const lines: { sku: string; qty: number }[] = []
  for (const raw of rawItems.slice(0, MAX_ITEMS)) {
    if (!raw || typeof raw !== 'object') continue
    const it = raw as { sku?: unknown; qty?: unknown }
    const sku = typeof it.sku === 'string' ? it.sku.trim() : ''
    const qty = Number(it.qty)
    if (!sku || !Number.isInteger(qty) || qty <= 0) continue
    lines.push({ sku, qty: Math.min(qty, MAX_QTY) })
  }
  if (lines.length === 0) {
    console.error('order-submit reject:', 'no_items', { received: rawItems.length })
    return res.status(400).json({ ok: false, error: 'no_items' })
  }

  const rawCustomer = (body.customer ?? {}) as Record<string, unknown>
  const customer = {
    name: clean(rawCustomer.name, 100),
    phone: clean(rawCustomer.phone, 30),
    city: clean(rawCustomer.city, 100),
    address: clean(rawCustomer.address, 300),
    email: clean(rawCustomer.email, 150),
    note: clean(rawCustomer.note, 500),
  }
  const missing = (['name', 'phone', 'city', 'address'] as const).filter((f) => !customer[f])
  if (missing.length) {
    console.error('order-submit reject:', 'missing_customer', { fields: missing })
    return res.status(400).json({ ok: false, error: 'missing_customer', fields: missing })
  }
  if (customer.email && !EMAIL_RE.test(customer.email)) {
    console.error('order-submit reject:', 'bad_email')
    return res.status(400).json({ ok: false, error: 'bad_email' })
  }
  if (body.paymentMethod !== 'bank' && body.paymentMethod !== 'cod') {
    console.error('order-submit reject:', 'bad_payment')
    return res.status(400).json({ ok: false, error: 'bad_payment' })
  }
  const paymentMethod: 'bank' | 'cod' = body.paymentMethod

  try {
    const prices = await fetchWooPrices()

    // Classify each line: unknown SKU (no Woo entry), no usable price, or OOS.
    const unknownSku: string[] = []
    const noPrice: string[] = []
    const oos: string[] = []
    for (const { sku } of lines) {
      const e = prices.get(sku)
      if (!e) unknownSku.push(sku)
      else if (e.price == null) noPrice.push(sku)
      else if (e.outOfStock) oos.push(sku)
    }
    if (oos.length) {
      console.error('order-submit reject:', 'out_of_stock', { skus: oos })
      return res.status(409).json({ ok: false, error: 'out_of_stock', items: oos })
    }
    if (unknownSku.length) {
      console.error('order-submit reject:', 'unknown_sku', { skus: unknownSku })
      return res.status(400).json({ ok: false, error: 'unknown_sku', items: unknownSku })
    }
    if (noPrice.length) {
      console.error('order-submit reject:', 'no_price', { skus: noPrice })
      return res.status(400).json({ ok: false, error: 'no_price', items: noPrice })
    }

    // Reseller tier from the REGISTRY (never the request). Distinguish the three
    // session conditions so a stale cookie never blocks ordering:
    //   misconfigured (secret missing) → 502, pricing is never silently downgraded.
    //   stale (invalid/expired cookie)  → clear it and continue as guest/retail.
    //   valid                            → apply the reseller's tier.
    let contract: { resellerEmail: string; tier: Tier } | null = null
    const sess = checkSession(req.headers.cookie, process.env.SESSION_SECRET)
    if (sess.status === 'misconfigured') {
      console.error('order-submit reject:', 'session_unavailable', { reason: 'secret_missing' })
      return res.status(502).json({ ok: false, error: 'session_unavailable' })
    }
    if (sess.status === 'stale') {
      res.setHeader('Set-Cookie', clearSessionCookie())
      console.warn('order-submit: stale session cookie cleared')
    }
    if (sess.status === 'valid') {
      const record = await readReseller(sess.user.email.toLowerCase())
      if (record && statusFor(record) === 'active') {
        contract = { resellerEmail: sess.user.email.toLowerCase(), tier: record.tier }
      }
      // signed-in but not an active reseller → retail (contract stays null)
    }
    // 'guest' → retail (contract stays null)

    // Server-computed money.
    const wooLines: WooLineItem[] = []
    let goodsTotal = 0
    for (const { sku, qty } of lines) {
      const e = prices.get(sku)!
      const unit = e.price as number
      const lineTotal = unit * qty
      goodsTotal += lineTotal
      wooLines.push({ product_id: e.productId, quantity: qty, subtotal: String(lineTotal), total: String(lineTotal) })
    }
    const payable = contract ? Math.round(goodsTotal * (1 - discountForTier(contract.tier))) : goodsTotal

    // Contract orders: prepend a compact, clearly-separated contract summary to the
    // customer note so it shows in WooCommerce's admin "New order" email (which does
    // not render order meta). Retail orders: the customer's note only.
    const mnt = (n: number) => `${n.toLocaleString('en-US')}₮`
    let customerNote = customer.note || ''
    if (contract) {
      const summary = [
        '=== SARA CONTRACT ORDER ===',
        `Reseller: ${contract.resellerEmail}`,
        `Tier: ${contract.tier}`,
        `Goods total: ${mnt(goodsTotal)}`,
        `Payable: ${mnt(payable)}`,
        '===========================',
      ].join('\n')
      customerNote = customer.note ? `${summary}\n\n${customer.note}` : summary
    }

    // Billing. Email is OPTIONAL at checkout, but WooCommerce rejects an empty-string
    // email (rest_invalid_email) — so include `email` only when the customer gave one.
    const billing: Record<string, unknown> = {
      first_name: customer.name,
      phone: customer.phone,
      address_1: customer.address,
      city: customer.city,
      country: 'MN',
    }
    if (customer.email) billing.email = customer.email

    // Build the WooCommerce order. Line items at retail; a negative fee carries the
    // contract discount so the order total equals `payable` (discount rounded at
    // the total, per spec). Stock management is NOT touched (manage_stock:false).
    const wooOrder: Record<string, unknown> = {
      // 'on-hold' = awaiting payment (our bank-transfer flow). Creating as on-hold
      // produces a pending→on-hold status transition, which is the hook WooCommerce's
      // "New order" admin email is registered on — a create-and-stay-'pending' order
      // fires no email.
      status: 'on-hold',
      currency: 'MNT',
      payment_method: paymentMethod === 'bank' ? 'bacs' : 'cod',
      payment_method_title: paymentMethod === 'bank' ? 'Bank transfer' : 'Cash on delivery',
      set_paid: false,
      billing,
      line_items: wooLines,
      customer_note: customerNote,
    }
    if (contract) {
      wooOrder.fee_lines = [
        { name: `Contract price (tier ${contract.tier})`, total: String(payable - goodsTotal), tax_status: 'none' },
      ]
      wooOrder.meta_data = [
        { key: 'Reseller', value: contract.resellerEmail },
        { key: 'Tier', value: String(contract.tier) },
        { key: 'Goods total (MNT)', value: String(goodsTotal) },
        { key: 'Payable (MNT)', value: String(payable) },
      ]
    }

    // Create the WooCommerce order. The shop is notified by WooCommerce's own
    // "New order" admin email (configured in WP admin) — no third-party email step.
    const created = await createWooOrder(wooOrder)

    return res.status(200).json({
      ok: true,
      orderNumber: created.number,
      goodsTotal,
      payable,
      contract: !!contract,
      tier: contract?.tier ?? null,
    })
  } catch (e) {
    console.error('[order-submit]', (e as Error).message)
    return res.status(502).json({ ok: false, error: 'order_failed' })
  }
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}
