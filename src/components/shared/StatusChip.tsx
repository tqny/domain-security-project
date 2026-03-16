import { cn } from '@/lib/utils'
import type { CaseStatus, Priority, DomainStatus, ActionStatus } from '@/types'
import {
  Plus,
  CheckCircle2,
  Search,
  Gavel,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  Minus,
  ArrowDownRight,
  Flame,
  Eye,
  Ban,
  Clock,
  Send,
  Loader,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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

const statusIcons: Record<string, Record<string, LucideIcon>> = {
  status: {
    New: Plus,
    Triaged: CheckCircle2,
    Investigating: Search,
    Enforcement: Gavel,
    Closed: XCircle,
  },
  priority: {
    Critical: AlertTriangle,
    High: ArrowUpRight,
    Medium: Minus,
    Low: ArrowDownRight,
  },
  'domain-status': {
    Active: Flame,
    Monitoring: Eye,
    Incident: AlertTriangle,
    Suspended: Ban,
  },
  'action-status': {
    Queued: Clock,
    Sent: Send,
    'In Progress': Loader,
    Resolved: CheckCircle2,
    Denied: XCircle,
  },
}

type ChipType = 'status' | 'priority' | 'domain-status' | 'action-status'

interface StatusChipProps {
  value: CaseStatus | Priority | DomainStatus | ActionStatus
  type: ChipType
  showIcon?: boolean
  className?: string
}

const styleMap: Record<ChipType, Record<string, string>> = {
  status: statusStyles,
  priority: priorityStyles,
  'domain-status': domainStatusStyles,
  'action-status': actionStatusStyles,
}

export default function StatusChip({ value, type, showIcon = true, className }: StatusChipProps) {
  const styles = styleMap[type]
  const style = styles[value as keyof typeof styles]
  const Icon = showIcon ? statusIcons[type]?.[value] : undefined

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        style,
        className
      )}
    >
      {Icon && <Icon className="size-3" />}
      <span className="size-1.5 rounded-full bg-current" />
      {value}
    </span>
  )
}
