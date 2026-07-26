// Reseller auth (Phase A1) — identity only. The session lives in an httpOnly
// cookie the browser can't read; this store just reflects what /api/auth-me
// reports. Sign-in and sign-out are full-page navigations to the server
// endpoints (/api/auth-login, /api/auth-logout), so there is no token handling
// here and nothing sensitive is ever stored client-side.

import { create } from 'zustand'

export interface AuthUser {
  email: string
  name: string
  picture: string
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
      const user = (res.ok ? await res.json() : null) as AuthUser | null
      set({ user: user ?? null, status: 'ready' })
    } catch {
      set({ user: null, status: 'ready' })
    }
  },
}))
