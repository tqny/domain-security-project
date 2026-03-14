import { cn } from '@/lib/utils'
import type { CaseStatus, Priority } from '@/types'

const statusStyles: Record<CaseStatus, string> = {
  New: 'bg-primary/15 text-primary',
  Triaged: 'bg-chart-2/15 text-chart-2',
  Investigating: 'bg-warning/20 text-warning',
  Enforcement: 'bg-destructive/15 text-destructive',
  Closed: 'bg-muted text-muted-foreground',
}

const priorityStyles: Record<Priority, string> = {
  Low: 'bg-muted text-muted-foreground',
  Medium: 'bg-chart-2/15 text-chart-2',
  High: 'bg-warning/20 text-warning',
  Critical: 'bg-destructive/15 text-destructive',
}

interface StatusChipProps {
  value: CaseStatus | Priority
  type: 'status' | 'priority'
  className?: string
}

export default function StatusChip({ value, type, className }: StatusChipProps) {
  const styles = type === 'status' ? statusStyles : priorityStyles
  const style = styles[value as keyof typeof styles]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        style,
        className
      )}
    >
      {value}
    </span>
  )
}
