import { create } from 'zustand'
import type { AuthUser, LoginCredentials } from '@/types'
import { authService } from '@/services'

interface AuthStore {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initialize: async () => {
    const user = await authService.getCurrentUser()
    if (user) {
      set({ user, isAuthenticated: true })
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const user = await authService.login(credentials)
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  logout: async () => {
    await authService.logout()
    set({ user: null, isAuthenticated: false, error: null })
  },

  clearError: () => set({ error: null }),
}))
