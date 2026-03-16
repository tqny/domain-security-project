import { cn } from '@/lib/utils'

export type PeriodKey = '7days' | '30days' | 'all'

const periodLabels: Record<PeriodKey, string> = {
  '7days': '7 Days',
  '30days': '30 Days',
  all: 'All Time',
}

interface PeriodTabsProps {
  activePeriod: PeriodKey
  onPeriodChange: (period: PeriodKey) => void
}

export function PeriodTabs({ activePeriod, onPeriodChange }: PeriodTabsProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-surface-alt p-1">
      {(Object.keys(periodLabels) as PeriodKey[]).map((key) => (
        <button
          key={key}
          onClick={() => onPeriodChange(key)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-all sm:text-sm',
            activePeriod === key
              ? 'bg-surface text-foreground shadow-sm'
              : 'text-text-secondary hover:text-foreground',
          )}
        >
          {periodLabels[key]}
        </button>
      ))}
    </div>
  )
}
