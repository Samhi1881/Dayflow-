import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { AuthPage } from './pages/AuthPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<PlaceholderPage title="Employee Dashboard" eyebrow="My workspace" description="Your personal HR overview will appear here." />} />
          <Route path="/admin" element={<PlaceholderPage title="Admin Dashboard" eyebrow="Administration" description="Monitor your people operations from one place." />} />
          <Route path="/profile" element={<PlaceholderPage title="Profile" eyebrow="Personal details" description="Your profile and employment details will appear here." />} />
          <Route path="/attendance" element={<PlaceholderPage title="Attendance" eyebrow="Time & presence" description="Daily and weekly attendance records will appear here." />} />
          <Route path="/leave" element={<PlaceholderPage title="Leave" eyebrow="Time away" description="Submit and track your leave requests here." />} />
          <Route path="/admin/leave" element={<PlaceholderPage title="Leave Approvals" eyebrow="Administration" description="Pending leave requests will appear here for review." />} />
          <Route path="/employees" element={<PlaceholderPage title="Employees" eyebrow="People directory" description="Your employee directory will appear here." />} />
          <Route path="/payroll" element={<PlaceholderPage title="Payroll" eyebrow="Compensation" description="Your payroll information will appear here." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
