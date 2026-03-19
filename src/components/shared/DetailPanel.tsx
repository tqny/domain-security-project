import { useEffect, useRef } from 'react'
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
  const closeRef = useRef<HTMLButtonElement>(null)

  // Lock body scroll on mobile when panel is open
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      // Focus close button for keyboard accessibility
      setTimeout(() => closeRef.current?.focus(), 100)
      return () => {
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Backdrop — mobile only */}
      <div
        className="fixed inset-0 bg-black/50 md:hidden"
        style={{ zIndex: 'var(--z-overlay)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-label={title}
        className={cn(
          'fixed top-0 right-0 h-screen h-dvh bg-surface border-l border-border shadow-floating flex flex-col',
          'w-full sm:w-[85vw] md:w-[420px]',
          className
        )}
        style={{ zIndex: 'var(--z-overlay)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-4 md:px-5">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground truncate">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="shrink-0 flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors duration-[var(--duration-fast)]"
            aria-label="Close panel"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-5">
          {children}
        </div>
      </aside>
    </>
  )
}
