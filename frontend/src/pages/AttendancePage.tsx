import { useState } from 'react'
import { DashboardCard, EmptyState } from '../components/ui'

type AttendanceView = 'daily' | 'weekly'

export function AttendancePage() {
  const [view, setView] = useState<AttendanceView>('daily')
  return <>
    <div className="attendance-heading"><div><div className="eyebrow">Time & presence</div><h1 className="page-title">Attendance</h1><p className="page-description">Review your daily and weekly attendance once records are available.</p></div><div className="segmented-control" role="group" aria-label="Attendance view"><button className={view === 'daily' ? 'selected' : ''} onClick={() => setView('daily')} type="button">Daily</button><button className={view === 'weekly' ? 'selected' : ''} onClick={() => setView('weekly')} type="button">Weekly</button></div></div>
    <div className="attendance-layout"><DashboardCard title={view === 'daily' ? 'Daily attendance' : 'Weekly attendance'}><EmptyState message="Attendance records will appear when the attendance API is integrated." /></DashboardCard><aside className="attendance-note"><div className="eyebrow">Status</div><h2>Awaiting attendance data</h2><p>Check-in, check-out, and status actions will be enabled when supported by the backend contract.</p></aside></div>
  </>
}