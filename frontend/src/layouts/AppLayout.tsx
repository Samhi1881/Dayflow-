import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function AppLayout() {
  const { user, logout } = useAuth(); const navigate = useNavigate(); const isAdmin = user?.role.toLowerCase() === 'admin'
  const links = isAdmin ? [['Dashboard', '/admin/dashboard', '⌂'], ['Employees', '/employees', '♧'], ['Attendance', '/admin/attendance', '◷'], ['Leave Approvals', '/admin/leave', '✓'], ['Payroll', '/payroll', '▤']] : [['Dashboard', '/employee/dashboard', '◈'], ['Profile', '/profile', '○'], ['Attendance', '/attendance', '◷'], ['Leave', '/leave', '◇'], ['Payroll', '/payroll', '▤']]
  async function handleLogout() { await logout(); navigate('/login', { replace: true }) }
  return <div className="app-shell"><aside className="sidebar"><div className="brand">day<span>flow</span></div><div className="nav-label">Workspace</div><nav className="nav-list" aria-label="Main navigation">{links.map(([label, to, icon]) => <NavLink className="nav-link" key={to} to={to}><span className="nav-icon" aria-hidden="true">{icon}</span>{label}</NavLink>)}<button className="nav-link nav-button" type="button" onClick={handleLogout}><span className="nav-icon" aria-hidden="true">↪</span>Logout</button></nav></aside><div className="main-area"><header className="topbar"><span className="topbar-title">People operations, made clear</span><div className="user-chip"><span>{user?.name}</span><span className="avatar" aria-hidden="true">{user?.name.slice(0, 2).toUpperCase()}</span></div></header><main className="content"><Outlet /></main></div></div>
}