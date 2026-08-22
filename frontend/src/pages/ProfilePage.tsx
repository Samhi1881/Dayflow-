import { Link } from 'react-router-dom'
import { DashboardCard, EmptyState } from '../components/ui'
import { useAuth } from '../hooks/useAuth'

export function ProfilePage() {
  const { user } = useAuth()
  if (!user) return null
  return <>
    <div className="profile-heading"><div className="profile-avatar" aria-hidden="true">{user.name.slice(0, 2).toUpperCase()}</div><div><div className="eyebrow">Your account</div><h1 className="page-title">Profile</h1><p className="page-description">Review the account details provided by your workspace.</p></div></div>
    <div className="profile-grid"><DashboardCard title="Personal details"><dl className="detail-list"><div><dt>Full name</dt><dd>{user.name}</dd></div><div><dt>Email address</dt><dd>{user.email}</dd></div></dl></DashboardCard><DashboardCard title="Workspace access"><dl className="detail-list"><div><dt>Account ID</dt><dd>{user.id}</dd></div><div><dt>Role</dt><dd className="role-value">{user.role}</dd></div></dl></DashboardCard></div>
    <section className="profile-note"><div><strong>Need to update your details?</strong><p>Profile editing will be available when the backend profile API is integrated.</p></div><Link className="profile-link" to="/employee/dashboard">Back to dashboard <span aria-hidden="true">→</span></Link></section>
    <div className="profile-extra"><div className="eyebrow">Additional information</div><EmptyState message="Job details, documents, and profile picture will appear when supported by the profile API." /></div>
  </>
}