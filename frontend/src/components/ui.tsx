import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

export function DashboardCard({ title, children }: { title: string; children?: ReactNode }) { return <section className="dashboard-card"><h2>{title}</h2>{children}</section> }
export function Button({ children, type = 'button', disabled = false }: { children: ReactNode; type?: 'button' | 'submit'; disabled?: boolean }) { return <button className="button-primary" disabled={disabled} type={type}>{children}</button> }
export function StatusBadge({ children }: { children: ReactNode }) { return <span className="status-badge">{children}</span> }
export function DataTable({ children }: { children?: ReactNode }) { return <div className="data-table" role="region" aria-label="Data table">{children}</div> }
export function FormInput({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) { return <label className="field-label">{label}<input {...props} /></label> }
export function SelectInput({ label, children, ...props }: { label: string; children?: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) { return <label className="field-label">{label}<select {...props}>{children}</select></label> }
export function Modal({ title, children }: { title: string; children?: ReactNode }) { return <section aria-label={title} className="modal">{children}</section> }
export function LoadingState() { return <div className="placeholder">Loading...</div> }
export function EmptyState({ message = 'There is nothing to show yet.' }: { message?: string }) { return <div className="placeholder"><div className="placeholder-mark" aria-hidden="true">+</div><h2>No records yet</h2><p>{message}</p></div> }
export function ErrorState({ message = 'Something went wrong. Please try again.' }: { message?: string }) { return <div className="error-message" role="alert">{message}</div> }