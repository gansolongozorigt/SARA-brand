import type { VercelRequest, VercelResponse } from '@vercel/node'
import { checkSession, clearSessionCookie } from './_authServer.js'
import { readReseller, statusFor, discountForTier } from './_reseller.js'

/**
 * Contract-price quote for an ACTIVE reseller (Phase B).
 *
 * POST body: [{ sku: string, qty: number }]. Prices are NEVER taken from the
 * client — they are fetched server-side from WooCommerce. Returns:
 *   { contract: true, tier, goodsTotal, payable }  for an active reseller
 *   { contract: false }                            otherwise / on any failure
 *
 * Fails closed: guests, non-resellers, expired resellers, bad input, or any
 * error all yield { contract: false } so the cart/checkout fall back to retail.
 */
const MAX_QTY = 999
const MAX_ITEMS = 100

const noContract = (res: VercelResponse) => res.status(200).json({ contract: false })

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}

// Parse a WooCommerce price string/number into a non-negative number or null.
// (Mirrors src/lib/wooPrices.ts parsePrice.)
function parsePrice(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : null
  if (typeof value !== 'string') return null
  const t = value.trim()
  if (t === '') return null
  const n = Number(t)
  return Number.isFinite(n) && n >= 0 ? n : null
}

interface WooRow {
  sku?: unknown
  price?: unknown
  regular_price?: unknown
  sale_price?: unknown
  stock_status?: unknown
}

// Mirror src/lib/wooPrices.ts buildOverlayMap EXACTLY: sale price only when it's
// a real discount, else regular; only 'outofstock' is treated as unavailable —
// so goodsTotal and the client cart subtotal never disagree.
function selectPrice(row: WooRow): { price: number | null; outOfStock: boolean } {
  const regular = parsePrice(row.regular_price) ?? parsePrice(row.price)
  const sale = parsePrice(row.sale_price)
  let price: number | null
  if (sale != null && sale > 0 && (regular == null || sale < regular)) price = sale
  else price = regular ?? sale
  return { price, outOfStock: row.stock_status === 'outofstock' }
}

function wooEnv(): { wc: string; key: string; secret: string } {
  const { WOO_API_URL, WOO_CONSUMER_KEY, WOO_CONSUMER_SECRET } = process.env
  if (!WOO_API_URL || !WOO_CONSUMER_KEY || !WOO_CONSUMER_SECRET) throw new Error('Woo env missing')
  const base = WOO_API_URL.replace(/\/+$/, '')
  const wc = /\/wp-json\/wc\/v\d/.test(base) ? base : `${base}/wp-json/wc/v3`
  return { wc, key: WOO_CONSUMER_KEY, secret: WOO_CONSUMER_SECRET }
}

/** Fetch live prices/stock straight from WooCommerce (query-string auth). */
async function fetchWooPrices(): Promise<Map<string, { price: number | null; outOfStock: boolean }>> {
  const { wc, key, secret } = wooEnv()
  const url = `${wc}/products?per_page=100&consumer_key=${encodeURIComponent(key)}&consumer_secret=${encodeURIComponent(secret)}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`woo ${res.status}`)
  const rows = (await res.json()) as WooRow[]
  const map = new Map<string, { price: number | null; outOfStock: boolean }>()
  for (const r of Array.isArray(rows) ? rows : []) {
    if (r && typeof r.sku === 'string' && r.sku) map.set(r.sku, selectPrice(r))
  }
  return map
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Display-only pricing helper: never 502 (that would blank the cart). Retail is
    // always returned; the difference is signalled so the UI can explain it.
    const sess = checkSession(req.headers.cookie, process.env.SESSION_SECRET)
    if (sess.status === 'stale') {
      res.setHeader('Set-Cookie', clearSessionCookie())
      console.warn('b2b-quote: stale session cookie cleared')
    }
    if (sess.status === 'misconfigured') console.error('[b2b-quote] SESSION_SECRET missing')
    // A session cookie WAS present but contract pricing could not be applied
    // (server misconfig or a stale/expired-signature cookie). Flag it so the UI
    // can show a calm notice — NOT for genuine guests, and NOT for a logged-in
    // reseller whose contract has merely expired (that has its own renewal notice).
    if (sess.status === 'misconfigured' || sess.status === 'stale') {
      return res.status(200).json({ contract: false, contractPricingUnavailable: true })
    }
    if (sess.status !== 'valid') return noContract(res) // genuine guest → retail, no flag

    const record = await readReseller(sess.user.email.toLowerCase())
    if (!record || statusFor(record) !== 'active') return noContract(res) // none/expired → retail, no flag
    const tier = record.tier

    // Validate input — never crash on malformed data.
    const parsed = typeof req.body === 'string' ? safeParse(req.body) : req.body
    if (!Array.isArray(parsed)) return noContract(res)

    const lines: { sku: string; qty: number }[] = []
    for (const raw of parsed.slice(0, MAX_ITEMS)) {
      if (!raw || typeof raw !== 'object') continue
      const item = raw as { sku?: unknown; qty?: unknown }
      const sku = typeof item.sku === 'string' ? item.sku : ''
      const qty = Number(item.qty)
      if (!sku || !Number.isInteger(qty) || qty <= 0) continue
      lines.push({ sku, qty: Math.min(qty, MAX_QTY) })
    }
    if (lines.length === 0) return res.status(200).json({ contract: true, tier, goodsTotal: 0, payable: 0 })

    const prices = await fetchWooPrices()
    let goodsTotal = 0
    for (const { sku, qty } of lines) {
      const entry = prices.get(sku)
      if (!entry || entry.outOfStock || entry.price == null) continue // unknown SKU or out of stock → excluded
      goodsTotal += entry.price * qty
    }

    // payable = goodsTotal / (1 + tier/100), via the single-source discount map.
    // Round the TOTAL (not per line) to whole MNT.
    const payable = Math.round(goodsTotal * (1 - discountForTier(tier)))
    return res.status(200).json({ contract: true, tier, goodsTotal, payable })
  } catch (e) {
    console.error('[b2b-quote]', (e as Error).message)
    return noContract(res)
  }
}
