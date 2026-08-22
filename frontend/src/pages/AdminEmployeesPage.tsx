import { useEffect, useState } from 'react'
import { DashboardCard, ErrorState, LoadingState, StatusBadge } from '../components/ui'
import { apiErrorMessage, getAdminEmployees, type Salary } from '../services/dayflowService'

export function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Salary[]>([])
  const [error, setError] = useState('')
  useEffect(() => { getAdminEmployees().then(setEmployees).catch((requestError) => setError(apiErrorMessage(requestError))) }, [])
  return <><div className="eyebrow">People directory</div><h1 className="page-title">Employees</h1><p className="page-description">Review current salary records across the team.</p>{error && <ErrorState message={error} />}<DashboardCard title="Salary records">{!error && !employees.length ? <LoadingState /> : employees.length ? <div className="record-list">{employees.map((employee) => <div className="record-row" key={employee.userId}><span><strong>Employee #{employee.userId}</strong><small>Annual base salary</small></span><StatusBadge>{Number(employee.salary || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</StatusBadge></div>)}</div> : <div className="live-panel">No salary records found.</div>}</DashboardCard></>
}