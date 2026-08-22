import { api } from './api'

export type AttendanceRecord = { id: number; userId: number; date: string; checkInAt: string | null; checkOutAt: string | null; status: string }
export type LeaveRequest = { id: number; userId: number; startDate: string; endDate: string; type: string; reason: string; status: string; adminComment: string | null; reviewedBy: number | null }
export type Profile = { userId: number; firstName: string; lastName: string; email: string; role: string; phone: string | null; address: string | null; department: string | null; jobTitle: string | null; avatarUrl: string | null; dateJoined: string | null; salary?: string | number | null }
export type Salary = { userId: number; salary: string | number | null }

export function apiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (!error || typeof error !== 'object' || !('response' in error)) return fallback
  const response = (error as { response?: { data?: { error?: { message?: string } }; status?: number } }).response
  return response?.data?.error?.message || (response?.status === 401 ? 'Your session has expired.' : fallback)
}

export async function getProfile() { return (await api.get<{ data: { profile: Profile } }>('/profile/me')).data.data.profile }
export async function updateProfile(payload: Partial<Profile>) { return (await api.put<{ data: { profile: Profile } }>('/profile/me', payload)).data.data.profile }
export async function getAttendance(from?: string, to?: string) { return (await api.get<{ data: { attendance: AttendanceRecord[] } }>('/attendance/me', { params: { from, to } })).data.data.attendance }
export async function checkIn() { return (await api.post<{ data: { attendance: AttendanceRecord } }>('/attendance/checkin')).data.data.attendance }
export async function checkOut() { return (await api.post<{ data: { attendance: AttendanceRecord } }>('/attendance/checkout')).data.data.attendance }
export async function getLeave(status?: string) { return (await api.get<{ data: { leave: LeaveRequest[] } }>('/leave/me', { params: status ? { status } : {} })).data.data.leave }
export async function createLeave(payload: { type: string; startDate: string; endDate: string; reason: string }) { return (await api.post<{ data: { leave: LeaveRequest } }>('/leave', payload)).data.data.leave }
export async function getSalary() { return (await api.get<{ data: { payroll: Salary } }>('/payroll/me')).data.data.payroll }
export async function getAdminEmployees() { return (await api.get<{ data: { payroll: Salary[] } }>('/admin/payroll')).data.data.payroll }
export async function getAdminLeave(status?: string) { return (await api.get<{ data: { leave: LeaveRequest[] } }>('/admin/leave', { params: status ? { status } : {} })).data.data.leave }
export async function decideLeave(id: number, decision: 'approve' | 'reject', comment?: string) { return (await api.patch<{ data: { leave: LeaveRequest } }>(`/admin/leave/${id}/${decision}`, { comment })).data.data.leave }