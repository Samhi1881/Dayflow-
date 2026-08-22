import { api } from './api'

export interface AuthUser {
  id: string | number
  name: string
  email: string
  role: 'admin' | 'employee' | string
}

interface AuthResponse {
  user?: AuthUser
  data?: AuthUser
}

function getUser(response: AuthResponse): AuthUser {
  const user = response.user ?? response.data
  if (!user) throw new Error('The server returned an invalid user response.')
  return user
}

export async function login(email: string, password: string) {
  const response = await api.post<AuthResponse>('/auth/login', { email, password })
  return getUser(response.data)
}

export async function register(name: string, email: string, password: string) {
  const response = await api.post<AuthResponse>('/auth/register', { name, email, password })
  return getUser(response.data)
}

export async function getCurrentUser() {
  const response = await api.get<AuthResponse>('/auth/me')
  return getUser(response.data)
}

export async function logout() {
  // The agreed contract does not define a logout endpoint; clearing context ends the client session.
}