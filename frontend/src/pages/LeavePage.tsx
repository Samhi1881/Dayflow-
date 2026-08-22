import { useState } from 'react'
import { DashboardCard, EmptyState } from '../components/ui'

type LeaveFilter = 'all' | 'pending' | 'approved' | 'rejected'

const filters: { label: string; value: LeaveFilter }[] = [
  { label: 'All requests', value: 'all' }, { label: 'Pending', value: 'pending' }, { label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' },
]

export function LeavePage() {
  const [filter, setFilter] = useState<LeaveFilter>('all')
  return <>
    <div className="leave-heading"><div><div className="eyebrow">Time away</div><h1 className="page-title">Leave</h1><p className="page-description">Submit and track your time away from work.</p></div><button className="button-primary" disabled type="button">Request leave</button></div>
    <div className="leave-filter" role="group" aria-label="Leave request status">{filters.map((item) => <button className={filter === item.value ? 'selected' : ''} key={item.value} onClick={() => setFilter(item.value)} type="button">{item.label}</button>)}</div>
    <div className="leave-grid"><DashboardCard title="Request history"><EmptyState message={filter === 'all' ? 'Your leave requests will appear here.' : `Your ${filter} requests will appear here.`} /></DashboardCard><DashboardCard title="Leave balance"><EmptyState message="Leave balances will appear when supported by the leave API." /></DashboardCard></div>
    <section className="leave-info"><div className="eyebrow">Request leave</div><h2>Application form pending API support</h2><p>Leave types, date rules, remarks, and submission fields will be enabled once the backend contract is available.</p></section>
  </>
}