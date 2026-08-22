import { useEffect, useState } from 'react'
import { DashboardCard, EmptyState, ErrorState, FormInput, LoadingState } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { apiErrorMessage, getProfile, updateProfile, type Profile } from '../services/dayflowService'

export function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ phone: '', address: '', department: '', jobTitle: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  useEffect(() => { getProfile().then((value) => { setProfile(value); setForm({ phone: value.phone || '', address: value.address || '', department: value.department || '', jobTitle: value.jobTitle || '' }) }).catch((requestError) => setError(apiErrorMessage(requestError))) }, [])
  async function save(event: React.FormEvent) { event.preventDefault(); try { setSaving(true); setError(''); setSuccess(''); setProfile(await updateProfile(form)); setEditing(false); setSuccess('Profile details saved.') } catch (requestError) { setError(apiErrorMessage(requestError)) } finally { setSaving(false) } }
  if (!user) return null
  return <>
    <div className="profile-heading"><div className="profile-avatar" aria-hidden="true">{user.name.slice(0, 2).toUpperCase()}</div><div><div className="eyebrow">Your account</div><h1 className="page-title">Profile</h1><p className="page-description">Review the account details provided by your workspace.</p></div></div>
    {error && <ErrorState message={error} />}{success && <div className="success-message" role="status">{success}</div>}{!error && !profile ? <LoadingState /> : <><div className="profile-grid"><DashboardCard title="Personal details"><dl className="detail-list"><div><dt>Full name</dt><dd>{profile ? `${profile.firstName} ${profile.lastName}` : user.name}</dd></div><div><dt>Email address</dt><dd>{profile?.email || user.email}</dd></div><div><dt>Phone</dt><dd>{profile?.phone || 'Not provided'}</dd></div></dl></DashboardCard><DashboardCard title="Workspace access"><dl className="detail-list"><div><dt>Account ID</dt><dd>{user.id}</dd></div><div><dt>Role</dt><dd className="role-value">{profile?.role || user.role}</dd></div><div><dt>Department</dt><dd>{profile?.department || 'Not assigned'}</dd></div><div><dt>Job title</dt><dd>{profile?.jobTitle || 'Not assigned'}</dd></div></dl></DashboardCard></div><section className="profile-note"><div><strong>{editing ? 'Edit personal details' : 'Keep your profile current'}</strong>{editing ? <form className="inline-form" onSubmit={save}><FormInput label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /><FormInput label="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /><button className="button-primary" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save changes'}</button></form> : <p>Update contact details when they change.</p>}</div>{!editing && <button className="profile-link text-button" onClick={() => setEditing(true)} type="button">Edit details</button>}</section><div className="profile-extra"><div className="eyebrow">Additional information</div><EmptyState message="Job details are provided by your people operations team." /></div></>}
  </>
}