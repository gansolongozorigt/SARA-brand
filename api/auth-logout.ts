import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getOrigin, clearSessionCookie } from './_authServer'

/** Clear the session cookie and redirect home. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  let home = '/'
  try {
    home = `${getOrigin(req)}/`
  } catch {
    // Fall back to a relative redirect if the host can't be validated.
  }
  res.setHeader('Set-Cookie', clearSessionCookie())
  res.setHeader('Location', home)
  return res.status(302).end()
}
