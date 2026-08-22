import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { AuthPage } from './pages/AuthPage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { EmployeeDashboard } from './pages/EmployeeDashboard'
import { ProfilePage } from './pages/ProfilePage'
import { AttendancePage } from './pages/AttendancePage'
import { LeavePage } from './pages/LeavePage'
import { PayrollPage } from './pages/PayrollPage'
import { AdminEmployeesPage } from './pages/AdminEmployeesPage'
import { AdminLeavePage } from './pages/AdminLeavePage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
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
          <Route path="/payroll" element={<PayrollPage />} />
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/leave" element={<AdminLeavePage />} />
            <Route path="/employees" element={<AdminEmployeesPage />} />
          </Route>
        </Route></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
