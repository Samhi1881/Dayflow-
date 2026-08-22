import { useEffect, useState } from 'react'
import { DashboardCard, ErrorState, LoadingState } from '../components/ui'
import { apiErrorMessage, getAdminEmployees, getAdminLeave } from '../services/dayflowService'

export function AdminDashboardPage() {
  const [employees, setEmployees] = useState(0)
  const [pending, setPending] = useState(0)
  const [error, setError] = useState('')
  useEffect(() => { Promise.all([getAdminEmployees(), getAdminLeave('pending')]).then(([salaryRecords, pendingRequests]) => { setEmployees(salaryRecords.length); setPending(pendingRequests.length) }).catch((requestError) => setError(apiErrorMessage(requestError))) }, [])
  return <><div className="eyebrow">Administration</div><h1 className="page-title">Admin dashboard</h1><p className="page-description">A live view of your people operations workspace.</p>{error && <ErrorState message={error} />}<div className="dashboard-grid"><DashboardCard title="Employees">{error ? null : employees ? <div className="metric-value">{employees}<small>salary records</small></div> : <LoadingState />}</DashboardCard><DashboardCard title="Pending leave">{error ? null : <div className="metric-value">{pending}<small>requests awaiting review</small></div>}</DashboardCard></div></>
}