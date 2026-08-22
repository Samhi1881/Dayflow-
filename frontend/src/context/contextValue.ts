import { createContext } from 'react'
import type { AuthUser } from '../services/authService'

export interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<AuthUser>
  register: (name: string, email: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)