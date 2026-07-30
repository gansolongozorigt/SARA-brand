// Server-only auth helpers for the reseller Google Sign-In (Phase A1).
//
// Lives OUTSIDE api/ so Vercel never turns it into a route; the flat
// api/auth-*.ts functions import it. Never imported by any src/ (browser) file —
// it uses node:crypto and must never reach the client. GOOGLE_CLIENT_SECRET and
// SESSION_SECRET are read here and must never appear in any response.

import crypto from 'node:crypto'
import type { VercelRequest } from '@vercel/node'

export const SESSION_COOKIE = 'sara_session'
export const STATE_COOKIE = 'sara_oauth_state'

const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days (seconds)
const STATE_MAX_AGE = 60 * 10 // 10 minutes (seconds)

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs'
export const CALLBACK_PATH = '/api/auth-callback'

// Hosts allowed to originate the OAuth redirect URI — guards against a forged
// Host header pointing the flow at an attacker origin.
const ALLOWED_HOST_PATTERNS: RegExp[] = [
  /^sarabrand\.mn$/,
  /^www\.sarabrand\.mn$/,
  /^[a-z0-9-]+\.vercel\.app$/,
]

export interface SessionUser {
  email: string
  name: string
  picture: string
}

interface SessionPayload extends SessionUser {
  iat: number
  exp: number
}

// ----- env -----

export interface AuthEnv {
  clientId: string
  clientSecret: string
  sessionSecret: string
}

export function requireEnv(): AuthEnv {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET } = process.env
  const missing = (
    [
      ['GOOGLE_CLIENT_ID', GOOGLE_CLIENT_ID],
      ['GOOGLE_CLIENT_SECRET', GOOGLE_CLIENT_SECRET],
      ['SESSION_SECRET', SESSION_SECRET],
    ] as const
  )
    .filter(([, v]) => !v)
    .map(([k]) => k)
  if (missing.length) throw new Error(`Missing required env var(s): ${missing.join(', ')}`)
  return {
    clientId: GOOGLE_CLIENT_ID as string,
    clientSecret: GOOGLE_CLIENT_SECRET as string,
    sessionSecret: SESSION_SECRET as string,
  }
}

// ----- small helpers -----

function firstHeader(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

export function firstQuery(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? ''
}

function b64url(input: crypto.BinaryLike): string {
  return Buffer.from(input as Buffer | string).toString('base64url')
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s, 'base64url')
}

function hmac(data: string, secret: string): Buffer {
  return crypto.createHmac('sha256', secret).update(data).digest()
}

/** Constant-time string compare that never throws on length mismatch. */
export function safeCompare(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

// ----- origin / redirect URI -----

/**
 * Derive the request origin (https://host) from forwarded headers, validated
 * against the host allowlist so a forged Host header can't redirect the OAuth
 * flow elsewhere. Always https (cookies are Secure; Vercel is TLS-only).
 */
export function getOrigin(req: VercelRequest): string {
  const rawHost = firstHeader(req.headers['x-forwarded-host']) || firstHeader(req.headers.host)
  if (!rawHost) throw new Error('missing host header')
  const host = rawHost.split(':')[0].toLowerCase()
  if (!ALLOWED_HOST_PATTERNS.some((re) => re.test(host))) {
    throw new Error('host not in allowlist')
  }
  return `https://${host}`
}

export function redirectUri(origin: string): string {
  return `${origin}${CALLBACK_PATH}`
}

export function googleAuthUrl(params: {
  clientId: string
  redirectUri: string
  state: string
}): string {
  const qs = new URLSearchParams({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state: params.state,
    access_type: 'online',
    prompt: 'select_account',
  })
  return `${GOOGLE_AUTH_URL}?${qs.toString()}`
}

// ----- cookies -----

function serializeCookie(name: string, value: string, maxAge: number): string {
  return [`${name}=${value}`, 'Path=/', 'HttpOnly', 'Secure', 'SameSite=Lax', `Max-Age=${maxAge}`].join('; ')
}

function expireCookie(name: string): string {
  return [`${name}=`, 'Path=/', 'HttpOnly', 'Secure', 'SameSite=Lax', 'Max-Age=0'].join('; ')
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const pair of header.split(';')) {
    const eq = pair.indexOf('=')
    if (eq < 0) continue
    const k = pair.slice(0, eq).trim()
    const v = pair.slice(eq + 1).trim()
    if (k) out[k] = v
  }
  return out
}

// ----- oauth state -----

export function createState(): string {
  return crypto.randomBytes(32).toString('base64url')
}

export function stateCookie(state: string): string {
  return serializeCookie(STATE_COOKIE, state, STATE_MAX_AGE)
}

export function readStateCookie(cookieHeader: string | undefined): string | null {
  return parseCookies(cookieHeader)[STATE_COOKIE] ?? null
}

export function clearStateCookie(): string {
  return expireCookie(STATE_COOKIE)
}

// ----- session (signed cookie: base64url(payload).base64url(hmac)) -----

export function createSessionCookie(user: SessionUser, secret: string): string {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = { ...user, iat: now, exp: now + SESSION_MAX_AGE }
  const body = b64url(JSON.stringify(payload))
  const sig = b64url(hmac(body, secret))
  return serializeCookie(SESSION_COOKIE, `${body}.${sig}`, SESSION_MAX_AGE)
}

export function clearSessionCookie(): string {
  return expireCookie(SESSION_COOKIE)
}

/** Whether a session cookie is present at all (independent of validity). */
export function hasSessionCookie(cookieHeader: string | undefined): boolean {
  return !!parseCookies(cookieHeader)[SESSION_COOKIE]
}

/**
 * Read + verify the session cookie. Fails closed: any signature mismatch,
 * tampering, malformed value, or expiry returns null (never a partial session).
 */
export function readSession(cookieHeader: string | undefined, secret: string): SessionUser | null {
  const raw = parseCookies(cookieHeader)[SESSION_COOKIE]
  if (!raw) return null
  const dot = raw.indexOf('.')
  if (dot < 0) return null
  const body = raw.slice(0, dot)
  const sig = raw.slice(dot + 1)
  if (!body || !sig) return null

  const expected = b64url(hmac(body, secret))
  if (!safeCompare(sig, expected)) return null

  let payload: SessionPayload
  try {
    payload = JSON.parse(fromB64url(body).toString('utf8')) as SessionPayload
  } catch {
    return null
  }
  const now = Math.floor(Date.now() / 1000)
  if (typeof payload.exp !== 'number' || payload.exp < now) return null
  if (!payload.email) return null
  return { email: payload.email, name: payload.name ?? '', picture: payload.picture ?? '' }
}

/**
 * Classify a request's session into the three distinct conditions so callers
 * never conflate them (a stale cookie must self-heal, not block):
 *   'guest'         — no session cookie at all → treat as guest.
 *   'misconfigured' — cookie present but SESSION_SECRET missing/empty (server
 *                     misconfiguration; can't verify anything).
 *   'stale'         — cookie present but signature invalid or session expired
 *                     (rotated secret, wrong environment, expiry). The caller
 *                     should CLEAR the cookie (clearSessionCookie) and continue
 *                     as a guest — never a hard error.
 *   'valid'         — a verified session.
 */
export type SessionCheck =
  | { status: 'guest' }
  | { status: 'misconfigured' }
  | { status: 'stale' }
  | { status: 'valid'; user: SessionUser }

export function checkSession(cookieHeader: string | undefined, secret: string | undefined): SessionCheck {
  if (!hasSessionCookie(cookieHeader)) return { status: 'guest' }
  if (!secret) return { status: 'misconfigured' }
  const user = readSession(cookieHeader, secret)
  return user ? { status: 'valid', user } : { status: 'stale' }
}

// ----- Google token exchange + ID token verification -----

interface GoogleTokenResponse {
  id_token?: string
}

interface GoogleClaims {
  iss?: string
  aud?: string
  exp?: number
  sub?: string
  email?: string
  email_verified?: boolean | string
  name?: string
  picture?: string
}

export async function exchangeCode(params: {
  code: string
  redirectUri: string
  env: AuthEnv
}): Promise<string> {
  const body = new URLSearchParams({
    code: params.code,
    client_id: params.env.clientId,
    client_secret: params.env.clientSecret,
    redirect_uri: params.redirectUri,
    grant_type: 'authorization_code',
  })
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body,
  })
  if (!res.ok) throw new Error(`token endpoint ${res.status}`)
  const data = (await res.json()) as GoogleTokenResponse
  if (!data.id_token) throw new Error('no id_token in token response')
  return data.id_token
}

let jwksCache: { keys: crypto.JsonWebKey[]; fetchedAt: number } | null = null

async function googleJwks(): Promise<crypto.JsonWebKey[]> {
  const now = Date.now()
  if (jwksCache && now - jwksCache.fetchedAt < 60 * 60 * 1000) return jwksCache.keys
  const res = await fetch(GOOGLE_JWKS_URL, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`jwks endpoint ${res.status}`)
  const data = (await res.json()) as { keys?: (crypto.JsonWebKey & { kid?: string })[] }
  if (!data.keys?.length) throw new Error('empty jwks')
  jwksCache = { keys: data.keys, fetchedAt: now }
  return data.keys
}

/**
 * Verify a Google ID token against Google's published RSA public keys.
 * Checks RS256 signature, issuer, audience (client id) and expiry. Throws on any
 * failure. Returns the validated identity claims.
 */
export async function verifyGoogleIdToken(idToken: string, clientId: string): Promise<SessionUser> {
  const [h, p, s] = idToken.split('.')
  if (!h || !p || !s) throw new Error('malformed id_token')

  const header = JSON.parse(fromB64url(h).toString('utf8')) as { alg?: string; kid?: string }
  if (header.alg !== 'RS256') throw new Error(`unexpected alg ${header.alg}`)

  const keys = await googleJwks()
  const jwk = (keys as (crypto.JsonWebKey & { kid?: string })[]).find((k) => k.kid === header.kid)
  if (!jwk) throw new Error('signing key not found in jwks')

  const pubKey = crypto.createPublicKey({ key: jwk, format: 'jwk' })
  const ok = crypto.verify('RSA-SHA256', Buffer.from(`${h}.${p}`), pubKey, fromB64url(s))
  if (!ok) throw new Error('invalid id_token signature')

  const claims = JSON.parse(fromB64url(p).toString('utf8')) as GoogleClaims
  if (claims.iss !== 'https://accounts.google.com' && claims.iss !== 'accounts.google.com') {
    throw new Error('invalid issuer')
  }
  if (claims.aud !== clientId) throw new Error('audience mismatch')
  const now = Math.floor(Date.now() / 1000)
  if (typeof claims.exp !== 'number' || claims.exp < now) throw new Error('id_token expired')

  const verified = claims.email_verified === true || claims.email_verified === 'true'
  if (!claims.email || !verified) throw new Error('email not present or not verified')

  return { email: claims.email, name: claims.name ?? '', picture: claims.picture ?? '' }
}
