import { cn } from '@/lib/utils'
import type { CaseStatus, Priority, DomainStatus, ActionStatus } from '@/types'

const statusStyles: Record<CaseStatus, string> = {
  New: 'bg-accent-muted text-primary',
  Triaged: 'bg-info-muted text-info',
  Investigating: 'bg-warning-muted text-warning',
  Enforcement: 'bg-danger-muted text-destructive',
  Closed: 'bg-surface-alt text-text-secondary',
}

const priorityStyles: Record<Priority, string> = {
  Low: 'bg-surface-alt text-text-secondary',
  Medium: 'bg-info-muted text-info',
  High: 'bg-warning-muted text-warning',
  Critical: 'bg-danger-muted text-destructive',
}

const domainStatusStyles: Record<DomainStatus, string> = {
  Incident: 'bg-danger-muted text-destructive',
  Active: 'bg-warning-muted text-warning',
  Monitoring: 'bg-info-muted text-info',
  Suspended: 'bg-surface-alt text-text-secondary',
}

const actionStatusStyles: Record<ActionStatus, string> = {
  Queued: 'bg-surface-alt text-text-secondary',
  Sent: 'bg-info-muted text-info',
  'In Progress': 'bg-warning-muted text-warning',
  Resolved: 'bg-success-muted text-success',
  Denied: 'bg-danger-muted text-destructive',
}

type ChipType = 'status' | 'priority' | 'domain-status' | 'action-status'

interface StatusChipProps {
  value: CaseStatus | Priority | DomainStatus | ActionStatus
  type: ChipType
  className?: string
}

const styleMap: Record<ChipType, Record<string, string>> = {
  status: statusStyles,
  priority: priorityStyles,
  'domain-status': domainStatusStyles,
  'action-status': actionStatusStyles,
}

export default function StatusChip({ value, type, className }: StatusChipProps) {
  const styles = styleMap[type]
  const style = styles[value as keyof typeof styles]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        style,
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {value}
    </span>
  )
}
