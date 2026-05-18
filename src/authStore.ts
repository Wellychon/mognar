import { create } from 'zustand'
import { api, setAccessToken } from './lib/api'

export interface AuthUser {
  id: string
  nome: string
  email: string
  role: string
  tenantId: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const data = await api.post<{ accessToken: string; user: AuthUser }>('/auth/login', {
      email,
      password,
    })
    setAccessToken(data.accessToken)
    set({ user: data.user, isAuthenticated: true })
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignora erro no logout
    }
    setAccessToken(null)
    set({ user: null, isAuthenticated: false })
  },
}))
