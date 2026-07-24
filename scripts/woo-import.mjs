// WooCommerce importer for the 25 SARA products.
// Usage:  node scripts/woo-import.mjs --dry     (read-only preview, no writes)
//         node scripts/woo-import.mjs           (real run)
// Reads credentials from ../.env.woo.local (gitignored). Never logs secrets.
import { readFileSync } from 'node:fs'

const DRY = process.argv.includes('--dry')

// ---- credentials ----
function loadEnv() {
  const raw = readFileSync(new URL('../.env.woo.local', import.meta.url), 'utf8')
  const env = {}
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/)
    if (m) env[m[1]] = m[2].trim()
  }
  return env
}
const { WOO_URL, WOO_KEY, WOO_SECRET } = loadEnv()
if (!WOO_URL || !WOO_KEY || !WOO_SECRET) {
  console.error('❌ Missing WOO_URL / WOO_KEY / WOO_SECRET in .env.woo.local'); process.exit(1)
}
const BASE = `${WOO_URL.replace(/\/+$/, '')}/wp-json/wc/v3`
// This host strips the Authorization header (Basic Auth → 401), so use WooCommerce's
// query-string auth (consumer_key/secret as URL params). Safe because BASE is HTTPS.
const CREDS = `consumer_key=${encodeURIComponent(WOO_KEY)}&consumer_secret=${encodeURIComponent(WOO_SECRET)}`
const withAuth = (path) => `${BASE}/${path}${path.includes('?') ? '&' : '?'}${CREDS}`

async function api(method, path, body) {
  const res = await fetch(withAuth(path), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json; try { json = JSON.parse(text) } catch { json = text }
  if (!res.ok) {
    const msg = typeof json === 'object' ? (json.message || JSON.stringify(json)) : String(json)
    throw new Error(`${method} /${path} → ${res.status}: ${String(msg).slice(0, 240)}`)
  }
  return json
}
const getAll = (path) => api('GET', `${path}${path.includes('?') ? '&' : '?'}per_page=100`)

// ---- fixed config ----
const RAW = 'https://raw.githubusercontent.com/gansolongozorigt/SARA-brand/main/src/assets/products/'
const CATS = [
  { slug: 'skincare', name: 'Арьс арчилгаа' },
  { slug: 'mask',     name: 'Маск' },
  { slug: 'perfume',  name: 'Үнэртэн' },
  { slug: 'men',      name: 'Эрэгтэй' },
  { slug: 'bodycare', name: 'Бие арчилгаа' },
  { slug: 'set',      name: 'Багц' },
]
const SETTINGS = [
  ['woocommerce_currency', 'MNT'],
  ['woocommerce_currency_pos', 'right'],
  ['woocommerce_price_thousand_sep', ','],
  ['woocommerce_price_decimal_sep', '.'],
  ['woocommerce_price_num_decimals', '0'],
  ['woocommerce_default_country', 'MN'],
]
const ATTRS = [
  { slug: 'size',      name: 'Хэмжээ',          field: 'size' },
  { slug: 'skin-type', name: 'Тохиромжтой арьс', field: 'skinType' },
]
const PRODUCTS = JSON.parse(readFileSync(new URL('./woo_import_data.json', import.meta.url), 'utf8'))

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
function buildDescription(p) {
  const parts = []
  if (p.desc) parts.push(`<p>${esc(p.desc)}</p>`)
  if (p.specs?.length) parts.push(`<h4>Онцлог</h4>\n<ul>\n${p.specs.map((s) => `  <li>${esc(s)}</li>`).join('\n')}\n</ul>`)
  const d = []
  if (p.size) d.push(`  <li><strong>Хэмжээ:</strong> ${esc(p.size)}</li>`)
  if (p.usage) d.push(`  <li><strong>Хэрэглэх заавар:</strong> ${esc(p.usage)}</li>`)
  if (p.skinType) d.push(`  <li><strong>Тохиромжтой арьс:</strong> ${esc(p.skinType)}</li>`)
  if (p.ingredients) d.push(`  <li><strong>Найрлага:</strong> ${esc(p.ingredients)}</li>`)
  if (d.length) parts.push(`<h4>Дэлгэрэнгүй мэдээлэл</h4>\n<ul>\n${d.join('\n')}\n</ul>`)
  return parts.join('\n')
}

// Product POST with retry — the WP host occasionally cold-DNS-times-out fetching
// the remote images (cURL 28). A failed POST creates nothing, so retrying is safe.
async function createWithRetry(body, tries = 5) {
  for (let i = 0; i < tries; i++) {
    try { return await api('POST', 'products', body) }
    catch (e) {
      const transient = /image|cURL|timed out|Resolving|502|503|504/i.test(e.message)
      if (i < tries - 1 && transient) {
        console.log(`     transient image-fetch failure — retry ${i + 1}/${tries - 1} in 5s…`)
        await new Promise((r) => setTimeout(r, 5000)); continue
      }
      throw e
    }
  }
}

async function main() {
  console.log(`\n=== SARA → WooCommerce import ${DRY ? '(DRY RUN — no writes)' : '(LIVE)'} ===`)
  console.log(`Endpoint: ${BASE}\n`)

  // reachability + auth check
  const general = await getAll('settings/general').catch((e) => { console.error('❌ Auth/endpoint error:', e.message); process.exit(1) })
  console.log('✅ Authenticated, REST reachable.\n')

  // ---------- STEP A: settings ----------
  console.log('STEP A — store settings:')
  const byId = Object.fromEntries(general.map((s) => [s.id, s]))
  for (const [id, val] of SETTINGS) {
    const cur = byId[id]?.value
    const change = cur !== val
    console.log(`  ${id}: ${JSON.stringify(cur)} ${change ? `→ ${JSON.stringify(val)}` : '(already set ✓)'}`)
    if (!DRY && change) await api('PUT', `settings/general/${id}`, { value: val })
  }
  // confirm MNT is a valid option
  const curOpts = byId['woocommerce_currency']?.options || {}
  if (!('MNT' in curOpts)) console.log('  ⚠️  MNT not found in currency options — will verify on live run.')

  // ---------- STEP B: categories ----------
  console.log('\nSTEP B — categories:')
  const existingCats = await getAll('products/categories')
  const catBySlug = Object.fromEntries(existingCats.map((c) => [c.slug, c]))
  const catId = {}
  for (const c of CATS) {
    if (catBySlug[c.slug]) { catId[c.slug] = catBySlug[c.slug].id; console.log(`  ${c.slug}: exists (id ${catBySlug[c.slug].id}) ✓`) }
    else if (DRY) { console.log(`  ${c.slug}: would create "${c.name}"`) }
    else { const r = await api('POST', 'products/categories', { name: c.name, slug: c.slug }); catId[c.slug] = r.id; console.log(`  ${c.slug}: created "${c.name}" (id ${r.id})`) }
  }

  // ---------- attributes: LOCAL / custom per-product (option B) ----------
  // No taxonomy created — size + skinType are attached to each product as custom
  // attributes (shown in the "Additional information" tab). Convert to global later
  // once the free-text values are normalized.
  console.log('\nSTEP B2 — attributes: local/custom (Хэмжээ, Тохиромжтой арьс) attached per product; no taxonomy created.')

  // ---------- STEP C: products ----------
  console.log('\nSTEP C — products:')
  const existingProducts = await getAll('products')
  const bySku = Object.fromEntries(existingProducts.map((p) => [p.sku, p]))
  let created = 0, skipped = 0, errors = 0
  for (const p of PRODUCTS) {
    if (bySku[p.id]) { console.log(`  ${p.id}: SKIP (exists, id ${bySku[p.id].id})`); skipped++; continue }
    if (DRY) { console.log(`  ${p.id}: would create — ${p.price.toLocaleString()}₮, cat ${p.categorySlug}, ${p.images.length} img`); created++; continue }
    try {
      const attributes = ATTRS.filter((a) => p[a.field]).map((a) => ({ name: a.name, options: [p[a.field]], visible: true }))
      const body = {
        name: p.name, type: 'simple', status: 'publish', sku: p.id,
        regular_price: String(p.price),
        categories: [{ id: catId[p.categorySlug] }],
        short_description: p.short || '',
        description: buildDescription(p),
        images: p.images.map((f, i) => ({ src: RAW + f, position: i })),
        attributes,
      }
      const r = await createWithRetry(body)
      console.log(`  ${p.id}: created (id ${r.id}) — ${r.permalink}`)
      created++
    } catch (e) { console.log(`  ${p.id}: ❌ ${e.message}`); errors++ }
  }

  console.log(`\n=== Summary${DRY ? ' (DRY)' : ''}: ${DRY ? 'would create' : 'created'} ${created}, skipped ${skipped}${errors ? `, errors ${errors}` : ''} ===`)
  if (DRY) console.log('No changes were made. Re-run without --dry to execute.')
}
main().catch((e) => { console.error('❌ Fatal:', e.message); process.exit(1) })
