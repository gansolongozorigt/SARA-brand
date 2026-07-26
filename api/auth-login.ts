import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireEnv, getOrigin, redirectUri, createState, stateCookie, googleAuthUrl } from './_authServer.js'

/**
 * Start the Google OAuth authorization-code flow. Generates a random state,
 * stashes it in a short-lived httpOnly cookie, and redirects to Google's consent
 * screen requesting only openid/email/profile.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let env
  let origin
  try {
    env = requireEnv()
    origin = getOrigin(req)
  } catch (e) {
    console.error('[auth-login]', (e as Error).message)
    return res.status(500).json({ error: 'Auth not configured' })
  }

  const state = createState()
  res.setHeader('Set-Cookie', stateCookie(state))
  res.setHeader('Location', googleAuthUrl({ clientId: env.clientId, redirectUri: redirectUri(origin), state }))
  return res.status(302).end()
}
