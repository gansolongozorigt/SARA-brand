import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readSession } from './_authServer.js'

/**
 * Return the current reseller identity as JSON: { email, name, picture } or null.
 * Never returns tokens. Fails closed — any problem (missing secret, tampered or
 * expired cookie) responds with null, i.e. "not logged in".
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = process.env.SESSION_SECRET
  if (!secret) return res.status(200).json(null)

  const user = readSession(req.headers.cookie, secret)
  return res.status(200).json(user)
}
