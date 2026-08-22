import { useEffect, useState } from 'react'
import { DashboardCard, ErrorState, LoadingState } from '../components/ui'
import { apiErrorMessage, getSalary, type Salary } from '../services/dayflowService'
import { getAdminEmployees } from '../services/dayflowService'
import { useAuth } from '../hooks/useAuth'

export function PayrollPage() {
  const { user } = useAuth()
  const [payroll, setPayroll] = useState<Salary | null>(null)
  const [records, setRecords] = useState<Salary[]>([])
  const [error, setError] = useState('')
  useEffect(() => { if (user?.role.toLowerCase() === 'admin') getAdminEmployees().then(setRecords).catch((requestError) => setError(apiErrorMessage(requestError))); else getSalary().then(setPayroll).catch((requestError) => setError(apiErrorMessage(requestError))) }, [user?.role])
  return <><div className="eyebrow">Compensation</div><h1 className="page-title">Payroll</h1><p className="page-description">{user?.role.toLowerCase() === 'admin' ? 'Review current salary records across the team.' : 'Your current salary information.'}</p>{error && <ErrorState message={error} />}{user?.role.toLowerCase() === 'admin' ? <DashboardCard title="Salary records">{records.length ? <div className="record-list">{records.map((record) => <div className="record-row" key={record.userId}><strong>Employee #{record.userId}</strong><span className="salary-inline">{Number(record.salary || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></div>)}</div> : !error && <LoadingState />}</DashboardCard> : <DashboardCard title="Current salary">{error ? null : payroll ? <div className="salary-value">{Number(payroll.salary || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}<small>Annual base salary</small></div> : <LoadingState />}</DashboardCard>}</>
}