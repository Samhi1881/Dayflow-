import { Link } from 'react-router-dom'
import { DashboardCard, EmptyState } from '../components/ui'
import { useAuth } from '../hooks/useAuth'

const quickLinks = [
  { label: 'Profile', description: 'Review your personal details', path: '/profile', icon: '○' },
  { label: 'Attendance', description: 'View your time and presence', path: '/attendance', icon: '◷' },
  { label: 'Leave', description: 'Track time away from work', path: '/leave', icon: '◇' },
  { label: 'Payroll', description: 'View compensation details', path: '/payroll', icon: '▤' },
]

export function EmployeeDashboard() {
  const { user } = useAuth()
  return <>
    <div className="dashboard-heading"><div><div className="eyebrow">Employee workspace</div><h1 className="page-title">Good to see you, {user?.name.split(' ')[0]}</h1><p className="page-description">Here is your people operations overview.</p></div><Link className="profile-link" to="/profile">View profile <span aria-hidden="true">→</span></Link></div>
    <div className="quick-links">{quickLinks.map((link) => <Link className="quick-link" key={link.path} to={link.path}><span className="quick-link-icon" aria-hidden="true">{link.icon}</span><span><strong>{link.label}</strong><small>{link.description}</small></span><span className="quick-link-arrow" aria-hidden="true">↗</span></Link>)}</div>
    <div className="dashboard-grid"><DashboardCard title="Today's attendance"><EmptyState message="Attendance information will appear when the attendance API is available." /></DashboardCard><DashboardCard title="Leave summary"><EmptyState message="Your leave balance and requests will appear here." /></DashboardCard><DashboardCard title="Payroll summary"><EmptyState message="Your latest payroll information will appear here." /></DashboardCard><DashboardCard title="Recent activity"><EmptyState message="Recent activity and alerts will appear here." /></DashboardCard></div>
  </>
}