import { useEffect, useState, type ReactNode } from 'react'
import axios from 'axios'
import * as authService from '../services/authService'
import type { AuthUser } from '../services/authService'
import { AuthContext } from './contextValue'

function getErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) return 'Something went wrong. Please try again.'
  if (!error.response) return 'Unable to reach the server. Check your connection and try again.'
  if (error.response.status === 401) return 'Your email or password is incorrect.'
  if (error.response.status === 403) return 'You do not have permission to do that.'
  if (error.response.status === 404) return 'The requested authentication service was not found.'
  if (error.response.status === 422 || error.response.status === 400) return 'Please check your details and try again.'
  if (error.response.status >= 500) return 'The server is unavailable right now. Please try again later.'
  return 'Unable to complete that request. Please try again.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    authService.getCurrentUser().then(setUser).catch(() => setUser(null)).finally(() => setIsLoading(false))
  }, [])

  async function perform(action: () => Promise<AuthUser>) {
    setError(null)
    try { const authenticatedUser = await action(); setUser(authenticatedUser); return authenticatedUser } catch (requestError) { const message = getErrorMessage(requestError); setError(message); throw new Error(message) }
  }

  async function logout() { await authService.logout(); setUser(null); setError(null) }

  return <AuthContext.Provider value={{ user, isLoading, error, login: (email, password) => perform(() => authService.login(email, password)), register: (name, email, password) => perform(() => authService.register(name, email, password)), logout, clearError: () => setError(null) }}>{children}</AuthContext.Provider>
}

