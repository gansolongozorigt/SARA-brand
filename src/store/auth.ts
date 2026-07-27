// Reseller auth (Phase A1) — identity only. The session lives in an httpOnly
// cookie the browser can't read; this store just reflects what /api/auth-me
// reports. Sign-in and sign-out are full-page navigations to the server
// endpoints (/api/auth-login, /api/auth-logout), so there is no token handling
// here and nothing sensitive is ever stored client-side.

import { create } from 'zustand'

export type ResellerStatus = 'none' | 'active' | 'expired'

export interface ResellerSelf {
  status: ResellerStatus
  tier: number | null
  expiry: string | null // 'YYYY-MM-DD'
}

export interface AuthUser {
  email: string
  name: string
  picture: string
  isAdmin: boolean
  reseller: ResellerSelf
}

interface AuthState {
  user: AuthUser | null
  status: 'idle' | 'loading' | 'ready'
  /** Fetch the current session once; fails closed to logged-out. */
  fetchMe: () => Promise<void>
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  status: 'idle',
  fetchMe: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading' })
    try {
      const res = await fetch('/api/auth-me', {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      })
      const raw = (res.ok ? await res.json() : null) as Partial<AuthUser> | null
      // Normalize so downstream UI always has isAdmin + reseller present.
      const user: AuthUser | null =
        raw && raw.email
          ? {
              email: raw.email,
              name: raw.name ?? '',
              picture: raw.picture ?? '',
              isAdmin: raw.isAdmin ?? false,
              reseller: raw.reseller ?? { status: 'none', tier: null, expiry: null },
            }
          : null
      set({ user, status: 'ready' })
    } catch {
      set({ user: null, status: 'ready' })
    }
  },
}))
