import { useEffect, useState } from 'react'
import { DashboardCard, ErrorState, LoadingState, StatusBadge } from '../components/ui'
import { apiErrorMessage, decideLeave, getAdminLeave, type LeaveRequest } from '../services/dayflowService'

export function AdminLeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [error, setError] = useState('')
  const [working, setWorking] = useState<number | null>(null)
  async function load() { try { setError(''); setRequests(await getAdminLeave('pending')) } catch (requestError) { setError(apiErrorMessage(requestError)) } }
  useEffect(() => { void load() }, [])
  async function decide(id: number, action: 'approve' | 'reject') { try { setWorking(id); await decideLeave(id, action); await load() } catch (requestError) { setError(apiErrorMessage(requestError)) } finally { setWorking(null) } }
  return <><div className="eyebrow">Administration</div><h1 className="page-title">Leave approvals</h1><p className="page-description">Review pending requests from your team.</p>{error && <ErrorState message={error} />}<DashboardCard title="Pending requests">{!error && !requests.length ? <LoadingState /> : requests.length ? <div className="record-list">{requests.map((item) => <div className="record-row" key={item.id}><span><strong>Employee #{item.userId} · {item.type}</strong><small>{item.startDate} to {item.endDate} · {item.reason}</small></span><span className="action-row"><StatusBadge>pending</StatusBadge><button className="button-secondary" disabled={working === item.id} onClick={() => decide(item.id, 'reject')} type="button">Reject</button><button className="button-primary compact-button" disabled={working === item.id} onClick={() => decide(item.id, 'approve')} type="button">Approve</button></span></div>)}</div> : <div className="live-panel">No pending leave requests.</div>}</DashboardCard></>
}