import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { AuthPage } from './pages/AuthPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { EmployeeDashboard } from './pages/EmployeeDashboard'
import { ProfilePage } from './pages/ProfilePage'
import { AttendancePage } from './pages/AttendancePage'
import { LeavePage } from './pages/LeavePage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route element={<ProtectedRoute />}><Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/employee/dashboard" replace />} />
          <Route path="/dashboard" element={<Navigate to="/employee/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/leave" element={<LeavePage />} />
          <Route path="/payroll" element={<PlaceholderPage title="Payroll" eyebrow="Compensation" description="Your payroll information will appear here." />} />
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin/dashboard" element={<PlaceholderPage title="Admin Dashboard" eyebrow="Administration" description="Monitor your people operations from one place." />} />
            <Route path="/admin/leave" element={<PlaceholderPage title="Leave Approvals" eyebrow="Administration" description="Pending leave requests will appear here for review." />} />
            <Route path="/employees" element={<PlaceholderPage title="Employees" eyebrow="People directory" description="Your employee directory will appear here." />} />
          </Route>
        </Route></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
