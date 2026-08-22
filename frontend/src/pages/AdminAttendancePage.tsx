import { useEffect, useState } from 'react'
import { DashboardCard, EmptyState, ErrorState, LoadingState, StatusBadge } from '../components/ui'
import { apiErrorMessage, getAdminAttendance, type AttendanceRecord } from '../services/dayflowService'

export function AdminAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { getAdminAttendance().then(setRecords).catch((requestError) => setError(apiErrorMessage(requestError))).finally(() => setLoading(false)) }, [])
  return <><div className="eyebrow">Administration</div><h1 className="page-title">Attendance overview</h1><p className="page-description">Review attendance records across the team.</p>{error && <ErrorState message={error} />}<DashboardCard title="Recent records">{loading ? <LoadingState /> : records.length ? <div className="record-list">{records.map((record) => <div className="record-row" key={record.id}><span><strong>Employee #{record.userId} · {record.date}</strong><small>{record.checkInAt ? new Date(record.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No check-in'}{record.checkOutAt ? ` to ${new Date(record.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</small></span><StatusBadge>{record.status}</StatusBadge></div>)}</div> : <EmptyState message="No attendance records found." />}</DashboardCard></>
}