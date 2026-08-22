import { useEffect, useState } from 'react'
import { DashboardCard, EmptyState, ErrorState, FormInput, LoadingState, SelectInput, StatusBadge } from '../components/ui'
import { apiErrorMessage, createLeave, getLeave, type LeaveRequest } from '../services/dayflowService'

type LeaveFilter = 'all' | 'pending' | 'approved' | 'rejected'

const filters: { label: string; value: LeaveFilter }[] = [
  { label: 'All requests', value: 'all' }, { label: 'Pending', value: 'pending' }, { label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' },
]

export function LeavePage() {
  const [filter, setFilter] = useState<LeaveFilter>('all')
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ type: 'paid', startDate: '', endDate: '', reason: '' })
  async function load() { try { setError(''); setRequests(await getLeave(filter === 'all' ? undefined : filter)) } catch (requestError) { setError(apiErrorMessage(requestError)) } finally { setLoading(false) } }
  useEffect(() => { setLoading(true); void load() }, [filter])
  async function submit(event: React.FormEvent) { event.preventDefault(); try { setSaving(true); setError(''); await createLeave(form); setForm({ type: 'paid', startDate: '', endDate: '', reason: '' }); setOpen(false); await load() } catch (requestError) { setError(apiErrorMessage(requestError)) } finally { setSaving(false) } }
  return <>
    <div className="leave-heading"><div><div className="eyebrow">Time away</div><h1 className="page-title">Leave</h1><p className="page-description">Submit and track your time away from work.</p></div><button className="button-primary" onClick={() => setOpen((value) => !value)} type="button">{open ? 'Close form' : 'Request leave'}</button></div>
    {error && <ErrorState message={error} />}
    {open && <form className="live-panel leave-form" onSubmit={submit}><SelectInput label="Leave type" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="paid">Paid</option><option value="sick">Sick</option><option value="unpaid">Unpaid</option></SelectInput><FormInput label="Start date" required type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /><FormInput label="End date" required type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} /><FormInput label="Reason" required value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} /><button className="button-primary" disabled={saving} type="submit">{saving ? 'Submitting...' : 'Submit request'}</button></form>}
    <div className="leave-filter" role="group" aria-label="Leave request status">{filters.map((item) => <button className={filter === item.value ? 'selected' : ''} key={item.value} onClick={() => setFilter(item.value)} type="button">{item.label}</button>)}</div>
    <div className="leave-grid"><DashboardCard title="Request history">{loading ? <LoadingState /> : requests.length ? <div className="record-list">{requests.map((item) => <div className="record-row" key={item.id}><span><strong>{item.type} leave · {item.startDate}</strong><small>{item.reason}</small></span><StatusBadge>{item.status}</StatusBadge></div>)}</div> : <EmptyState message={filter === 'all' ? 'Your leave requests will appear here.' : `Your ${filter} requests will appear here.`} />}</DashboardCard><DashboardCard title="Leave balance"><div className="live-panel"><strong>Request-based tracking</strong><p className="muted-text">Balances are managed by your people operations team.</p></div></DashboardCard></div>
  </>
}