import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readSession } from './_authServer.js'
import { readReseller, selfView, storageConfigured, isAdminEmail } from './_reseller.js'

/**
 * Return the current user's identity plus THEIR OWN reseller status:
 *   { email, name, picture, isAdmin, reseller: { status, tier, expiry } } or null.
 *
 * Never returns tokens, never the discount, and never anyone else's record —
 * only the signed-in user's own status is looked up. Fails closed: any problem
 * (missing secret, tampered/expired cookie) responds with null ("not logged in").
 * A registry read failure degrades to status "none" so the storefront never breaks.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = process.env.SESSION_SECRET
  if (!secret) return res.status(200).json(null)

  const user = readSession(req.headers.cookie, secret)
  if (!user) return res.status(200).json(null)

  let reseller = selfView(undefined) // default: { status: 'none', tier: null, expiry: null }
  if (storageConfigured()) {
    try {
      const record = await readReseller(user.email.toLowerCase())
      reseller = selfView(record)
    } catch (e) {
      // Degrade gracefully — identity still returns, status stays "none".
      console.error('[auth-me] reseller lookup failed:', (e as Error).message)
    }
  }

  return res.status(200).json({ ...user, isAdmin: isAdminEmail(user.email), reseller })
}
