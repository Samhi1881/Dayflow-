import { NavLink, Outlet } from 'react-router-dom'

const links = [
  ['Overview', '/dashboard', '◈'], ['Profile', '/profile', '○'], ['Attendance', '/attendance', '◷'], ['Leave', '/leave', '◇'], ['Payroll', '/payroll', '▤'],
  ['Admin dashboard', '/admin', '⌂'], ['Employees', '/employees', '♧'], ['Leave approvals', '/admin/leave', '✓'],
]

export function AppLayout() {
  return <div className="app-shell"><aside className="sidebar"><div className="brand">day<span>flow</span></div><div className="nav-label">Workspace</div><nav className="nav-list" aria-label="Main navigation">{links.map(([label, to, icon]) => <NavLink className="nav-link" key={to} to={to}><span className="nav-icon" aria-hidden="true">{icon}</span>{label}</NavLink>)}</nav></aside><div className="main-area"><header className="topbar"><span className="topbar-title">People operations, made clear</span><div className="user-chip"><span>Workspace</span><span className="avatar" aria-hidden="true">HR</span></div></header><main className="content"><Outlet /></main></div></div>
}