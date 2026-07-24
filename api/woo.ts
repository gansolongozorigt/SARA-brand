import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Server-side WooCommerce READ proxy.
 *
 * Concrete route (/api/woo). All /api/woo/<sub-path> requests are funneled here by
 * the rewrite in vercel.json (/api/woo/:path+ → /api/woo?wpath=:path+) — this
 * project (Vite, zero-config api/) does not reliably honor a [...path] catch-all
 * for nested segments, so we route explicitly.
 *
 * Exposes a tiny allowlisted read surface so the browser never sees the consumer
 * key/secret. Credentials come only from server env (never VITE_-prefixed, never
 * client-supplied) and are injected as query params — this host strips the
 * Authorization header, so Basic Auth 401s; query-string auth over HTTPS works.
 *
 * Allowed (GET only):
 *   /api/woo/products
 *   /api/woo/products/categories
 *   /api/woo/products/<numeric id>
 * Everything else → 403. Non-GET → 405. No orders/customers/settings/writes ever.
 */

// Client query params we forward (everything else — including wpath and any
// client-supplied consumer_key/secret — is stripped).
const ALLOWED_QUERY = ['per_page', 'page', 'category', 'slug', 'orderby', 'order', 'search'] as const

// TEMP: set to true to include a non-sensitive `debug` object on 403 responses
// while we confirm path extraction on this deployment. Remove once verified.
const DEBUG = true

function requireEnv() {
  const { WOO_API_URL, WOO_CONSUMER_KEY, WOO_CONSUMER_SECRET } = process.env
  const missing = (
    [
      ['WOO_API_URL', WOO_API_URL],
      ['WOO_CONSUMER_KEY', WOO_CONSUMER_KEY],
      ['WOO_CONSUMER_SECRET', WOO_CONSUMER_SECRET],
    ] as const
  )
    .filter(([, v]) => !v)
    .map(([k]) => k)
  if (missing.length) throw new Error(`Missing required env var(s): ${missing.join(', ')}`)
  return {
    apiUrl: WOO_API_URL as string,
    key: WOO_CONSUMER_KEY as string,
    secret: WOO_CONSUMER_SECRET as string,
  }
}

// Normalize to the WC v3 base whether WOO_API_URL is the site root or already the API base.
function wcBase(url: string): string {
  const trimmed = url.replace(/\/+$/, '')
  return /\/wp-json\/wc\/v\d/.test(trimmed) ? trimmed : `${trimmed}/wp-json/wc/v3`
}

const first = (v: string | string[] | undefined): string => (Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))
// Pull the part after "/api/woo/" out of a path/URI (ignores route patterns with brackets).
function afterPrefix(s: string): string {
  const path = (s || '').split('?')[0]
  const m = path.match(/\/api\/woo\/(.+)$/)
  return m && !m[1].includes('[') ? m[1] : ''
}

/**
 * Extract the WooCommerce sub-path robustly across pre/post-rewrite URL shapes.
 * Tries, in order: the rewrite's ?wpath param (req.query, then the raw req.url
 * query), then the original path from req.url and Vercel's forwarded-path headers.
 * The allowlist below is the real security boundary — a spoofed value can only
 * reach a permitted read path or get a 403, never a write/other resource.
 */
function extractSubPath(req: VercelRequest): { segments: string[]; debug: Record<string, unknown> } {
  const h = req.headers
  const url = new URL(req.url ?? '/', 'http://internal')

  const wpathQuery = first(req.query.wpath)
  const wpathUrlQuery = url.searchParams.get('wpath') ?? ''
  const xForwardedUri = first(h['x-forwarded-uri'] as string | string[] | undefined)
  const xOriginalPath = first(h['x-vercel-original-path'] as string | string[] | undefined)
  const xMatchedPath = first(h['x-matched-path'] as string | string[] | undefined)

  let rest =
    wpathQuery ||
    wpathUrlQuery ||
    afterPrefix(url.pathname) ||
    afterPrefix(xForwardedUri) ||
    afterPrefix(xOriginalPath) ||
    afterPrefix(xMatchedPath)

  rest = rest.split('?')[0]
  const segments = rest.split('/').filter(Boolean).map(decodeURIComponent)

  const debug = {
    reqUrl: req.url,
    pathname: url.pathname,
    wpathQuery,
    wpathUrlQuery,
    xForwardedUri,
    xOriginalPath,
    xMatchedPath,
    segments,
  }
  return { segments, debug }
}

function isAllowed(p: string[]): boolean {
  if (p[0] !== 'products') return false
  if (p.length === 1) return true // products
  if (p.length === 2 && p[1] === 'categories') return true // products/categories
  if (p.length === 2 && /^[0-9]+$/.test(p[1])) return true // products/<id>
  return false
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Fail fast on misconfig, but never leak details to the client.
  let env
  try {
    env = requireEnv()
  } catch (e) {
    console.error('[woo-proxy]', (e as Error).message)
    return res.status(500).json({ error: 'Server misconfiguration' })
  }

  const { segments, debug } = extractSubPath(req)
  // TEMP diagnostics — never logs credentials (only routing/path info).
  console.error('[woo-proxy] path-debug', JSON.stringify(debug))

  if (!isAllowed(segments)) {
    return res.status(403).json(DEBUG ? { error: 'Forbidden', debug } : { error: 'Forbidden' })
  }

  // Build upstream query from allowlisted params only; cap per_page at 100.
  const params = new URLSearchParams()
  for (const key of ALLOWED_QUERY) {
    const raw = req.query[key]
    const value = Array.isArray(raw) ? raw[0] : raw
    if (value == null || value === '') continue
    if (key === 'per_page') {
      const n = Math.min(100, Math.max(1, Number.parseInt(value, 10) || 0))
      if (n > 0) params.set('per_page', String(n))
    } else {
      params.set(key, value)
    }
  }
  // Inject credentials server-side (query-string auth — this host strips Authorization).
  params.set('consumer_key', env.key)
  params.set('consumer_secret', env.secret)

  const upstreamUrl = `${wcBase(env.apiUrl)}/${segments.join('/')}?${params.toString()}`

  let upstream: Response
  try {
    upstream = await fetch(upstreamUrl, { headers: { Accept: 'application/json' } })
  } catch (e) {
    console.error('[woo-proxy] upstream fetch failed:', (e as Error).message)
    return res.status(502).json({ error: 'Upstream request failed' })
  }

  if (!upstream.ok) {
    // Status code only — never echo the upstream body, URL, or credentials.
    return res.status(upstream.status).json({ error: 'Upstream error', status: upstream.status })
  }

  // Pass through WooCommerce pagination headers.
  const total = upstream.headers.get('x-wp-total')
  const totalPages = upstream.headers.get('x-wp-totalpages')
  if (total) res.setHeader('X-WP-Total', total)
  if (totalPages) res.setHeader('X-WP-TotalPages', totalPages)

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  return res.status(200).json(await upstream.json())
}
