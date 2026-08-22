import { useEffect, useState } from 'react'
import { DashboardCard, EmptyState, ErrorState, LoadingState, StatusBadge } from '../components/ui'
import { apiErrorMessage, checkIn, checkOut, getAttendance, type AttendanceRecord } from '../services/dayflowService'

type AttendanceView = 'daily' | 'weekly'

export function AttendancePage() {
  const [view, setView] = useState<AttendanceView>('daily')
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  async function load() { try { setError(''); setRecords(await getAttendance()) } catch (requestError) { setError(apiErrorMessage(requestError)) } finally { setLoading(false) } }
  useEffect(() => { void load() }, [])
  const today = records.find((record) => record.date === new Date().toISOString().slice(0, 10))
  async function mark(action: typeof checkIn) { try { setWorking(true); setError(''); await action(); await load() } catch (requestError) { setError(apiErrorMessage(requestError)) } finally { setWorking(false) } }
  return <>
    <div className="attendance-heading"><div><div className="eyebrow">Time & presence</div><h1 className="page-title">Attendance</h1><p className="page-description">Keep your daily presence record current.</p></div><div className="segmented-control" role="group" aria-label="Attendance view"><button className={view === 'daily' ? 'selected' : ''} onClick={() => setView('daily')} type="button">Daily</button><button className={view === 'weekly' ? 'selected' : ''} onClick={() => setView('weekly')} type="button">Weekly</button></div></div>
    {error && <ErrorState message={error} />}
    <div className="attendance-layout"><DashboardCard title={view === 'daily' ? "Today's attendance" : 'Recent attendance'}>{loading ? <LoadingState /> : view === 'daily' ? <div className="live-panel"><div className="record-summary"><strong>{today ? 'Attendance recorded' : 'Not checked in yet'}</strong>{today && <StatusBadge>{today.status}</StatusBadge>}</div><p className="muted-text">{today ? `Checked in ${today.checkInAt ? new Date(today.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}${today.checkOutAt ? ` · checked out ${new Date(today.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}` : 'Use the action below to start today\'s record.'}</p><div className="action-row"><button className="button-primary" disabled={working || Boolean(today)} onClick={() => mark(checkIn)} type="button">Check in</button><button className="button-secondary" disabled={working || !today || Boolean(today?.checkOutAt)} onClick={() => mark(checkOut)} type="button">Check out</button></div></div> : records.length ? <div className="record-list">{records.slice(0, 7).map((record) => <div className="record-row" key={record.id}><span><strong>{new Date(`${record.date}T00:00:00`).toLocaleDateString()}</strong><small>{record.checkInAt ? new Date(record.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No check-in'}</small></span><StatusBadge>{record.status}</StatusBadge></div>)}</div> : <EmptyState message="Your attendance records will appear here." />}</DashboardCard><aside className="attendance-note"><div className="eyebrow">Status</div><h2>{today ? 'You are on the clock' : 'Ready when you are'}</h2><p>{today ? 'Your attendance record for today is active.' : 'Check in when you begin work and check out when you finish.'}</p></aside></div>
  </>
}