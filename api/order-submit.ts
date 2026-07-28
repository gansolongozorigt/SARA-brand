import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readSession } from './_authServer.js'
import { readReseller, statusFor, discountForTier, type Tier } from './_reseller.js'

/**
 * Server-side order submission (Phase C). Creates a REAL WooCommerce order and
 * emails the shop. Prices, totals, tier and discount are ALL computed here — the
 * client sends only { items:[{sku,qty}], customer, paymentMethod }, never money.
 *
 * Responses:
 *   { ok:true, orderNumber, goodsTotal, payable, contract, tier }
 *   { ok:false, error:'invalid'|'out_of_stock'|'order_failed', items? }
 *
 * Partial failure: if the order is created but the email fails, we STILL return
 * success (email failure is logged server-side). If order creation fails, we
 * return an error and the client must not show success.
 */
const MAX_QTY = 999
const MAX_ITEMS = 100
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

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
  if (!res.ok) throw new Error(`woo order create ${res.status}`)
  const data = (await res.json()) as { id?: number; number?: string }
  if (!data.id) throw new Error('woo order create: no id')
  return { number: String(data.number ?? data.id), id: data.id }
}

// ----- notification email (server-side; server-computed values) -----

function money(n: number): string {
  return `${n.toLocaleString('en-US')}₮`
}

function buildEmail(input: {
  customer: { name: string; phone: string; city: string; address: string; email?: string; note?: string }
  paymentMethod: 'bank' | 'cod'
  lines: { name: string; qty: number; unit: number; total: number }[]
  goodsTotal: number
  payable: number
  contract: { resellerEmail: string; tier: number } | null
  orderNumber: string
}): string {
  const c = input.customer
  const out: string[] = []
  out.push(`NEW ORDER — SARA  (WooCommerce #${input.orderNumber})`)
  out.push('========================')
  out.push('')
  out.push('CUSTOMER')
  out.push(`  Name    : ${c.name}`)
  out.push(`  Phone   : ${c.phone}`)
  out.push(`  City    : ${c.city}`)
  out.push(`  Address : ${c.address}`)
  if (c.email) out.push(`  Email   : ${c.email}`)
  if (c.note) out.push(`  Note    : ${c.note}`)
  out.push('')
  out.push(`PAYMENT : ${input.paymentMethod === 'bank' ? 'Bank transfer' : 'Cash on delivery (COD)'}`)
  out.push('')
  out.push('ITEMS')
  for (const it of input.lines) {
    out.push(`  • ${it.name} × ${it.qty}  —  ${money(it.unit)} ea  =  ${money(it.total)}`)
  }
  out.push('')
  if (input.contract) {
    out.push('*** CONTRACT ORDER (reseller) ***')
    out.push(`  Reseller    : ${input.contract.resellerEmail}`)
    out.push(`  Tier        : ${input.contract.tier}`)
    out.push(`  Goods total : ${money(input.goodsTotal)}`)
    out.push(`  PAYABLE     : ${money(input.payable)}`)
    out.push('')
  }
  out.push(`GRAND TOTAL : ${money(input.contract ? input.payable : input.goodsTotal)}`)
  return out.join('\n')
}

async function sendEmail(subject: string, message: string, replyName: string, replyEmail: string): Promise<void> {
  const envKey = process.env.WEB3FORMS_ACCESS_KEY
  const accessKey = envKey || '591aa615-3e7d-47a1-b4f7-846e8b485e3f'
  const keySource = envKey ? 'env' : 'fallback' // which SOURCE, never the value
  const res = await fetch(WEB3FORMS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: accessKey,
      subject,
      from_name: 'SARA storefront',
      name: replyName,
      email: replyEmail || 'no-reply@sarabrand.mn',
      message,
    }),
  })
  // Read the raw body so we can log Web3Forms' actual error (their errors are
  // JSON with a `message`). Never log the access key itself.
  const rawBody = await res.text().catch(() => '')
  let success = false
  try {
    success = !!(JSON.parse(rawBody) as { success?: boolean }).success
  } catch {
    /* non-JSON body */
  }
  if (!res.ok || !success) {
    throw new Error(`web3forms rejected: status=${res.status} keySource=${keySource} body=${rawBody.slice(0, 400)}`)
  }
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
  if (!body || typeof body !== 'object') return res.status(400).json({ ok: false, error: 'invalid' })

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
  if (lines.length === 0) return res.status(400).json({ ok: false, error: 'invalid' })

  const rawCustomer = (body.customer ?? {}) as Record<string, unknown>
  const customer = {
    name: clean(rawCustomer.name, 100),
    phone: clean(rawCustomer.phone, 30),
    city: clean(rawCustomer.city, 100),
    address: clean(rawCustomer.address, 300),
    email: clean(rawCustomer.email, 150),
    note: clean(rawCustomer.note, 500),
  }
  if (!customer.name || !customer.phone || !customer.city || !customer.address) {
    return res.status(400).json({ ok: false, error: 'invalid' })
  }
  if (customer.email && !EMAIL_RE.test(customer.email)) {
    return res.status(400).json({ ok: false, error: 'invalid' })
  }
  const paymentMethod: 'bank' | 'cod' = body.paymentMethod === 'cod' ? 'cod' : body.paymentMethod === 'bank' ? 'bank' : 'bank'
  if (body.paymentMethod !== 'bank' && body.paymentMethod !== 'cod') {
    return res.status(400).json({ ok: false, error: 'invalid' })
  }

  try {
    const prices = await fetchWooPrices()

    // Unknown SKU or out-of-stock → reject clearly (never silently drop a line).
    const unknown: string[] = []
    const oos: string[] = []
    for (const { sku } of lines) {
      const e = prices.get(sku)
      if (!e || e.price == null) unknown.push(sku)
      else if (e.outOfStock) oos.push(sku)
    }
    if (oos.length) return res.status(409).json({ ok: false, error: 'out_of_stock', items: oos })
    if (unknown.length) return res.status(400).json({ ok: false, error: 'invalid', items: unknown })

    // Reseller tier from the REGISTRY (never the request).
    let contract: { resellerEmail: string; tier: Tier } | null = null
    const secret = process.env.SESSION_SECRET
    if (secret) {
      const session = readSession(req.headers.cookie, secret)
      if (session) {
        const record = await readReseller(session.email.toLowerCase())
        if (record && statusFor(record) === 'active') {
          contract = { resellerEmail: session.email.toLowerCase(), tier: record.tier }
        }
      }
    }

    // Server-computed money.
    const wooLines: WooLineItem[] = []
    const emailLines: { name: string; qty: number; unit: number; total: number }[] = []
    let goodsTotal = 0
    for (const { sku, qty } of lines) {
      const e = prices.get(sku)!
      const unit = e.price as number
      const lineTotal = unit * qty
      goodsTotal += lineTotal
      wooLines.push({ product_id: e.productId, quantity: qty, subtotal: String(lineTotal), total: String(lineTotal) })
      emailLines.push({ name: sku, qty, unit, total: lineTotal })
    }
    const payable = contract ? Math.round(goodsTotal * (1 - discountForTier(contract.tier))) : goodsTotal

    // Build the WooCommerce order. Line items at retail; a negative fee carries the
    // contract discount so the order total equals `payable` (discount rounded at
    // the total, per spec). Stock management is NOT touched (manage_stock:false).
    const wooOrder: Record<string, unknown> = {
      status: 'pending',
      currency: 'MNT',
      payment_method: paymentMethod === 'bank' ? 'bacs' : 'cod',
      payment_method_title: paymentMethod === 'bank' ? 'Bank transfer' : 'Cash on delivery',
      set_paid: false,
      billing: {
        first_name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address_1: customer.address,
        city: customer.city,
        country: 'MN',
      },
      line_items: wooLines,
      customer_note: customer.note || '',
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

    // Create the order first — this is the operation that must succeed.
    const created = await createWooOrder(wooOrder)

    // Then email the shop. A failure here must NOT fail the order.
    try {
      const subject = `SARA - new order #${created.number}${contract ? ' (contract)' : ''}`
      const message = buildEmail({ customer, paymentMethod, lines: emailLines, goodsTotal, payable, contract, orderNumber: created.number })
      await sendEmail(subject, message, customer.name, customer.email)
    } catch (e) {
      console.error('[order-submit] email failed (order still placed):', (e as Error).message)
    }

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
