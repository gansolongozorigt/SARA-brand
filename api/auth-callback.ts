import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  requireEnv,
  getOrigin,
  redirectUri,
  firstQuery,
  readStateCookie,
  clearStateCookie,
  safeCompare,
  exchangeCode,
  verifyGoogleIdToken,
  createSessionCookie,
} from '../lib/authServer'

/**
 * OAuth redirect target. Verifies state, exchanges the code for tokens
 * server-side, validates the ID token against Google's public keys, requires a
 * verified email, then sets the signed session cookie and redirects home.
 *
 * Fails closed: any problem clears the state cookie and redirects home with no
 * session created (never a partial/unverified session).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    console.error('[auth-callback]', (e as Error).message)
    return res.status(500).json({ error: 'Auth not configured' })
  }

  const home = `${origin}/`
  const fail = (reason: string) => {
    // Never leak details to the client — log server-side only.
    console.warn('[auth-callback] sign-in rejected:', reason)
    res.setHeader('Set-Cookie', clearStateCookie())
    res.setHeader('Location', home)
    return res.status(302).end()
  }

  if (firstQuery(req.query.error)) return fail('provider returned error')

  const code = firstQuery(req.query.code)
  const state = firstQuery(req.query.state)
  const cookieState = readStateCookie(req.headers.cookie)

  if (!code || !state || !cookieState) return fail('missing code/state')
  if (!safeCompare(state, cookieState)) return fail('state mismatch')

  try {
    const idToken = await exchangeCode({ code, redirectUri: redirectUri(origin), env })
    const user = await verifyGoogleIdToken(idToken, env.clientId)
    res.setHeader('Set-Cookie', [createSessionCookie(user, env.sessionSecret), clearStateCookie()])
    res.setHeader('Location', home)
    return res.status(302).end()
  } catch (e) {
    return fail((e as Error).message)
  }
}
