import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readSession } from './_authServer.js'
import {
  isAdminEmail,
  storageConfigured,
  listResellers,
  upsertReseller,
  deleteReseller,
  normalizeEmail,
  isValidTier,
  isValidExpiry,
} from './_reseller.js'

/**
 * Admin-only reseller registry CRUD.
 *   GET    → list all resellers
 *   POST   → create/update one { email, tier, expiry, note? }
 *   DELETE → remove one { email } (or ?email=)
 *
 * Admin status is verified server-side on EVERY request against ADMIN_EMAILS
 * using the signed session. Non-admins get a bare 403. No secrets in responses.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')

  const secret = process.env.SESSION_SECRET
  if (!secret) {
    console.error('[admin-resellers] SESSION_SECRET not set')
    return res.status(500).json({ error: 'Server misconfiguration' })
  }

  // Gate: must be a signed-in admin. Anything else → 403, no detail.
  const session = readSession(req.headers.cookie, secret)
  if (!isAdminEmail(session?.email)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (!storageConfigured()) {
    console.error('[admin-resellers] storage credentials not set')
    return res.status(503).json({ error: 'Storage not configured' })
  }

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ resellers: await listResellers() })
    }

    if (req.method === 'POST') {
      const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) ?? {}
      const email = normalizeEmail(body.email)
      if (!email) return res.status(400).json({ error: 'Invalid email' })
      if (!isValidTier(body.tier)) return res.status(400).json({ error: 'Invalid tier' })
      if (!isValidExpiry(body.expiry)) return res.status(400).json({ error: 'Invalid expiry' })
      const note = typeof body.note === 'string' ? body.note.slice(0, 200) : undefined
      const record = await upsertReseller({ email, tier: body.tier, expiry: body.expiry, note })
      return res.status(200).json({ reseller: record })
    }

    if (req.method === 'DELETE') {
      const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) ?? {}
      const email = normalizeEmail(body.email ?? req.query.email)
      if (!email) return res.status(400).json({ error: 'Invalid email' })
      const existed = await deleteReseller(email)
      return res.status(200).json({ deleted: existed })
    }

    res.setHeader('Allow', 'GET, POST, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (e) {
    // Never leak storage/token details.
    console.error('[admin-resellers]', (e as Error).message)
    return res.status(500).json({ error: 'Registry operation failed' })
  }
}

function safeParse(s: string): Record<string, unknown> | null {
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}
