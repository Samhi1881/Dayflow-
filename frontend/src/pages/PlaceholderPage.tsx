import { EmptyState } from '../components/ui'

export function PlaceholderPage({ title, eyebrow, description }: { title: string; eyebrow: string; description: string }) {
  return <><div className="eyebrow">{eyebrow}</div><h1 className="page-title">{title}</h1><p className="page-description">{description}</p><EmptyState message="This view is ready for live data from the HRMS API." /></>
}