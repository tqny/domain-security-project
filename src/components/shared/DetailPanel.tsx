import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface DetailPanelProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export default function DetailPanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  className,
}: DetailPanelProps) {
  if (!open) return null

  return (
    <aside
      className={cn(
        'fixed top-0 right-0 h-screen h-dvh w-[420px] bg-surface border-l border-border shadow-floating flex flex-col',
        className
      )}
      style={{ zIndex: 'var(--z-overlay)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground truncate">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors duration-[var(--duration-fast)]"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {children}
      </div>
    </aside>
  )
}
