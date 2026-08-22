import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardCard, EmptyState, ErrorState, LoadingState, StatusBadge } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { apiErrorMessage, getAttendance, getLeave, getSalary, type AttendanceRecord, type LeaveRequest, type Salary } from '../services/dayflowService'

const quickLinks = [
  { label: 'Profile', description: 'Review your personal details', path: '/profile', icon: '○' },
  { label: 'Attendance', description: 'View your time and presence', path: '/attendance', icon: '◷' },
  { label: 'Leave', description: 'Track time away from work', path: '/leave', icon: '◇' },
  { label: 'Payroll', description: 'View compensation details', path: '/payroll', icon: '▤' },
]

export function EmployeeDashboard() {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [leave, setLeave] = useState<LeaveRequest[]>([])
  const [salary, setSalary] = useState<Salary | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { Promise.all([getAttendance(), getLeave(), getSalary()]).then(([attendanceResult, leaveResult, salaryResult]) => { setAttendance(attendanceResult); setLeave(leaveResult); setSalary(salaryResult) }).catch((requestError) => setError(apiErrorMessage(requestError))) }, [])
  const today = attendance.find((record) => record.date === new Date().toISOString().slice(0, 10))
  return <>
    <div className="dashboard-heading"><div><div className="eyebrow">Employee workspace</div><h1 className="page-title">Good to see you, {user?.name.split(' ')[0]}</h1><p className="page-description">Here is your people operations overview.</p></div><Link className="profile-link" to="/profile">View profile <span aria-hidden="true">→</span></Link></div>
    <div className="quick-links">{quickLinks.map((link) => <Link className="quick-link" key={link.path} to={link.path}><span className="quick-link-icon" aria-hidden="true">{link.icon}</span><span><strong>{link.label}</strong><small>{link.description}</small></span><span className="quick-link-arrow" aria-hidden="true">↗</span></Link>)}</div>
    {error && <ErrorState message={error} />}<div className="dashboard-grid"><DashboardCard title="Today's attendance">{error ? null : today ? <div className="live-panel"><strong>Attendance recorded</strong><p className="muted-text">{today.checkInAt ? new Date(today.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Checked in'}</p><StatusBadge>{today.status}</StatusBadge></div> : <EmptyState message="You have not checked in today." />}</DashboardCard><DashboardCard title="Leave summary">{error ? null : leave.length ? <div className="live-panel"><strong>{leave.filter((item) => item.status === 'pending').length} pending requests</strong><p className="muted-text">{leave.length} total requests</p></div> : <EmptyState message="No leave requests yet." />}</DashboardCard><DashboardCard title="Payroll summary">{error ? null : salary ? <div className="live-panel salary-value">{Number(salary.salary || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}<small>Annual base salary</small></div> : <LoadingState />}</DashboardCard><DashboardCard title="Recent activity"><EmptyState message="Your latest attendance and leave activity will appear here." /></DashboardCard></div>
  </>
}