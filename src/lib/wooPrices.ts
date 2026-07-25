// Live pricing/stock overlay from the server-side WooCommerce read proxy.
//
// This module is PURE (no React, no product data): it fetches the allowlisted
// /api/woo/products endpoint and distills each row down to the only three fields
// WooCommerce is allowed to override — regular price, sale price, stock status —
// keyed by SKU. Everything else (names, translations, images, categories, specs)
// stays owned by src/data/products.ts. The WooCommerce SKU equals the products.ts
// `id` (e.g. "noire", "hand_cream").
//
// It never sees credentials — it only calls the same-origin proxy.

export type WooStockStatus = 'instock' | 'outofstock' | 'onbackorder'

/** The only values WooCommerce is allowed to override, per SKU. */
export interface LiveOverlay {
  /** Current selling price in MNT (sale price if on sale, else regular). */
  price: number
  /** Struck-through original price — present ONLY when the item is on sale. */
  old?: number
  stockStatus: WooStockStatus
}

export type OverlayMap = Record<string, LiveOverlay>

/** Shape we read from a WooCommerce product row (all values arrive as strings). */
interface WooProductRow {
  sku?: unknown
  price?: unknown
  regular_price?: unknown
  sale_price?: unknown
  stock_status?: unknown
}

const PROXY_URL = '/api/woo/products?per_page=100'
const FETCH_TIMEOUT_MS = 8000

/**
 * Parse a WooCommerce price into a non-negative number, or null if unusable.
 * Prices arrive as MNT strings ("129000"); empty/null/non-numeric → null so the
 * caller falls back to the static price rather than rendering 0 or NaN.
 */
export function parsePrice(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : null
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed === '') return null
  const n = Number(trimmed)
  return Number.isFinite(n) && n >= 0 ? n : null
}

function normalizeStock(value: unknown): WooStockStatus {
  if (value === 'outofstock' || value === 'onbackorder') return value
  return 'instock' // default/unknown → treat as available (safe fallback)
}

/** Build a SKU → overlay map from raw WooCommerce product rows. */
export function buildOverlayMap(rows: unknown): OverlayMap {
  const map: OverlayMap = {}
  if (!Array.isArray(rows)) return map

  for (const row of rows as WooProductRow[]) {
    if (!row || typeof row !== 'object') continue
    const sku = typeof row.sku === 'string' ? row.sku.trim() : ''
    if (!sku) continue

    const regular = parsePrice(row.regular_price) ?? parsePrice(row.price)
    const sale = parsePrice(row.sale_price)
    // No usable price at all → skip, so the static price stands.
    if (regular == null && sale == null) continue

    let price: number
    let old: number | undefined
    if (sale != null && sale > 0 && (regular == null || sale < regular)) {
      price = sale
      old = regular ?? undefined
    } else {
      price = regular ?? (sale as number)
      old = undefined
    }

    map[sku] = { price, old, stockStatus: normalizeStock(row.stock_status) }
  }
  return map
}

/**
 * Fetch live overlays from the proxy. Resolves to a SKU→overlay map, or throws
 * on any failure (network, timeout, non-2xx, bad shape) — the caller is expected
 * to catch and fall back to static data.
 */
export async function fetchLiveOverlays(): Promise<OverlayMap> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(PROXY_URL, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`proxy responded ${res.status}`)
    const data: unknown = await res.json()
    return buildOverlayMap(data)
  } finally {
    clearTimeout(timer)
  }
}
