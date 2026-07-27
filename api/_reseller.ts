// Server-only reseller registry (Phase A2). Storage = Upstash Redis (Vercel
// Marketplace). Free tier, no card, and its REST token is scoped to THIS single
// database — nothing beyond the registry store is reachable with that credential.
// The storage layer is isolated to the section at the bottom so it stays swappable.
//
// Lives in api/ with a leading underscore so Vercel does not route it, and is
// imported with an explicit .js extension (ESM). Never imported by any src/ file.
//
// Phase A2 is auth/registry only — the discount mapping is defined here for
// phase B to reuse, but NOTHING consumes the discount yet.

export const ALLOWED_TIERS = [30, 40, 50, 60, 70, 80] as const
export type Tier = (typeof ALLOWED_TIERS)[number]

export type ResellerStatus = 'none' | 'active' | 'expired'

export interface ResellerRecord {
  email: string // always stored lowercased
  tier: Tier
  expiry: string // 'YYYY-MM-DD'
  note?: string
  createdAt: string // ISO
  updatedAt: string // ISO
}

/** email(lowercased) -> record */
type ResellerMap = Record<string, ResellerRecord>

const REGISTRY_KEY = 'resellers'
const UB_TIMEZONE = 'Asia/Ulaanbaatar' // UTC+8, no DST

// ----- discount (single source of truth; phase B will consume this) -----

/**
 * Internal discount derived from the contract tier: you pay X and receive
 * X × (1 + tier/100) of goods, so discount = 1 − 1/(1 + tier/100).
 *   30→0.230769  40→0.285714  50→0.333333  60→0.375  70→0.411765  80→0.444444
 * Returns a fraction in [0,1). Defined once so phase B reuses it verbatim.
 */
export function discountForTier(tier: Tier): number {
  return 1 - 1 / (1 + tier / 100)
}

// ----- validation -----

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const email = raw.trim().toLowerCase()
  return EMAIL_RE.test(email) ? email : null
}

export function isValidTier(raw: unknown): raw is Tier {
  return typeof raw === 'number' && (ALLOWED_TIERS as readonly number[]).includes(raw)
}

/** Accept only a real calendar date in 'YYYY-MM-DD' (past or future both allowed). */
export function isValidExpiry(raw: unknown): raw is string {
  if (typeof raw !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false
  const [y, m, d] = raw.split('-').map(Number)
  if (m < 1 || m > 12 || d < 1 || d > 31) return false
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

// ----- status (computed server-side in Asia/Ulaanbaatar; never a client flag) -----

/** Today's date as 'YYYY-MM-DD' in Asia/Ulaanbaatar (UTC+8). */
function todayInUB(): string {
  // en-CA formats as YYYY-MM-DD; timeZone pins it to UB regardless of server region.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: UB_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/**
 * Status from a record (or absence). Expiry is valid THROUGH the end of that day
 * in UB, so an expiry equal to today's UB date is still "active". Lexicographic
 * compare of 'YYYY-MM-DD' is correct and DST-free.
 */
export function statusFor(record: ResellerRecord | undefined): ResellerStatus {
  if (!record) return 'none'
  return record.expiry >= todayInUB() ? 'active' : 'expired'
}

/** The self-view returned to a signed-in user: their own status only, no discount. */
export interface ResellerSelf {
  status: ResellerStatus
  tier: Tier | null
  expiry: string | null
}

export function selfView(record: ResellerRecord | undefined): ResellerSelf {
  const status = statusFor(record)
  if (!record) return { status, tier: null, expiry: null }
  return { status, tier: record.tier, expiry: record.expiry }
}

// ----- admin allowlist -----

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return admins.includes(email.trim().toLowerCase())
}

// ----- Edge Config storage -----

// The Vercel Upstash integration injects UPSTASH_REDIS_REST_*; some setups use the
// KV_REST_API_* aliases. Accept either so provisioning "just works".
function upstashCreds(): { url: string; token: string } {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) throw new Error('Upstash Redis credentials not set')
  return { url, token }
}

export function storageConfigured(): boolean {
  return !!(
    (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) &&
    (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN)
  )
}

/** Run a single Upstash REST command (["GET", key] / ["SET", key, value]). */
async function redisCommand(command: (string | number)[]): Promise<unknown> {
  const { url, token } = upstashCreds()
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  })
  if (!res.ok) throw new Error(`upstash ${res.status}`)
  const data = (await res.json()) as { result?: unknown; error?: string }
  if (data.error) throw new Error('upstash command error')
  return data.result
}

/** Read the whole registry (email -> record). Empty object if unset/absent. */
export async function readResellers(): Promise<ResellerMap> {
  const raw = await redisCommand(['GET', REGISTRY_KEY])
  if (typeof raw !== 'string' || raw === '') return {}
  try {
    const value = JSON.parse(raw) as ResellerMap
    return value && typeof value === 'object' ? value : {}
  } catch {
    return {}
  }
}

/** Look up a single reseller by (already-normalized) email. */
export async function readReseller(email: string): Promise<ResellerRecord | undefined> {
  const all = await readResellers()
  return all[email]
}

/** Overwrite the whole registry (rare write path). */
async function writeResellers(map: ResellerMap): Promise<void> {
  await redisCommand(['SET', REGISTRY_KEY, JSON.stringify(map)])
}

/** Create or update one reseller. Returns the stored record. */
export async function upsertReseller(input: {
  email: string
  tier: Tier
  expiry: string
  note?: string
}): Promise<ResellerRecord> {
  const all = await readResellers()
  const now = new Date().toISOString()
  const existing = all[input.email]
  const record: ResellerRecord = {
    email: input.email,
    tier: input.tier,
    expiry: input.expiry,
    note: input.note?.trim() || undefined,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  all[input.email] = record
  await writeResellers(all)
  return record
}

/** Delete one reseller by email. Returns true if it existed. */
export async function deleteReseller(email: string): Promise<boolean> {
  const all = await readResellers()
  if (!all[email]) return false
  delete all[email]
  await writeResellers(all)
  return true
}

/** All records as a sorted array (admin list). */
export async function listResellers(): Promise<(ResellerRecord & { status: ResellerStatus })[]> {
  const all = await readResellers()
  return Object.values(all)
    .map((r) => ({ ...r, status: statusFor(r) }))
    .sort((a, b) => a.email.localeCompare(b.email))
}
