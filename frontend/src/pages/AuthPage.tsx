import { Link } from 'react-router-dom'
import { Button } from '../components/ui'

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const isLogin = mode === 'login'
  return <main className="auth-page"><section className="auth-panel"><div className="brand">day<span>flow</span></div><div className="eyebrow">HRMS workspace</div><h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1><p>{isLogin ? 'Sign in to continue to your workspace.' : 'Set up your employee workspace access.'}</p><form className="auth-form"><label className="field-label">Work email<input type="email" name="email" autoComplete="email" /></label><label className="field-label">Password<input type="password" name="password" autoComplete={isLogin ? 'current-password' : 'new-password'} /></label>{!isLogin && <label className="field-label">Confirm password<input type="password" name="confirmPassword" autoComplete="new-password" /></label>}<Button type="submit">{isLogin ? 'Sign in' : 'Register'}</Button></form><Link className="auth-link" to={isLogin ? '/register' : '/login'}>{isLogin ? 'Need an account? Register' : 'Already have an account? Sign in'}</Link></section></main>
}