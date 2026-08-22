import { useEffect, useState } from 'react'
import { DashboardCard, ErrorState, LoadingState, StatusBadge } from '../components/ui'
import { apiErrorMessage, getAdminEmployees, updateSalary, type Salary } from '../services/dayflowService'

export function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Salary[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<number | null>(null)
  const [value, setValue] = useState('')
  async function save(userId: number) { try { setError(''); await updateSalary(userId, Number(value)); setEmployees(await getAdminEmployees()); setEditing(null) } catch (requestError) { setError(apiErrorMessage(requestError)) } }
  useEffect(() => { getAdminEmployees().then(setEmployees).catch((requestError) => setError(apiErrorMessage(requestError))).finally(() => setLoading(false)) }, [])
  return <><div className="eyebrow">People directory</div><h1 className="page-title">Employees</h1><p className="page-description">Review and manage current salary records.</p>{error && <ErrorState message={error} />}<DashboardCard title="Salary records">{loading ? <LoadingState /> : employees.length ? <div className="record-list">{employees.map((employee) => <div className="record-row" key={employee.userId}><span><strong>Employee #{employee.userId}</strong><small>Annual base salary</small></span>{editing === employee.userId ? <span className="action-row"><input aria-label={`Salary for employee ${employee.userId}`} min="1" onChange={(event) => setValue(event.target.value)} type="number" value={value} /><button className="button-primary compact-button" onClick={() => save(employee.userId)} type="button">Save</button></span> : <span className="action-row"><StatusBadge>{Number(employee.salary || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</StatusBadge><button className="button-secondary" onClick={() => { setEditing(employee.userId); setValue(String(employee.salary || '')) }} type="button">Edit</button></span>}</div>)}</div> : <div className="live-panel">No salary records found.</div>}</DashboardCard></>
}