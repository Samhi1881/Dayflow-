import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '../components/ui'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({ role }: { role?: 'admin' | 'employee' }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <LoadingState />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (role && user.role.toLowerCase() !== role) return <Navigate to={user.role.toLowerCase() === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} replace />
  return <Outlet />
}