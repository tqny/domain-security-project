import { NavLink, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppState } from '@/data/store'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import { workflowItems } from './nav-items'
import {
  Info,
  Radar,
} from 'lucide-react'

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const { hasData } = useAppState()
  const location = useLocation()

  // Close drawer on navigation
  useEffect(() => {
    onOpenChange(false)
  }, [location.pathname, onOpenChange])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[280px] bg-surface border-r border-border p-0"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-[18px] text-text-on-accent">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">Sentinel</span>
        </div>

        {/* Live Scan */}
        <nav className="px-3 mb-4">
          <NavLink
            to="/live-scan"
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium no-underline transition-all',
                'duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
                isActive
                  ? 'bg-accent-muted text-primary'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary" />
                )}
                <Radar className="size-5" />
                <span>Live Scan</span>
              </>
            )}
          </NavLink>
        </nav>

        {/* Workflow nav */}
        <nav className="px-3 mb-4">
          <div className="mb-2 px-3 text-xs font-medium uppercase tracking-widest text-text-tertiary">
            Workflow
          </div>
          {!hasData && (
            <div className="mb-2 px-3 text-[10px] text-text-tertiary/60">
              Scan to unlock
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            {workflowItems.map((item) =>
              hasData ? (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium no-underline transition-all',
                      'duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
                      isActive
                        ? 'bg-accent-muted text-primary'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary" />
                      )}
                      <span className={cn('shrink-0', isActive ? 'opacity-100' : 'opacity-70')}>
                        <item.icon className="size-5" />
                      </span>
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ) : (
                <div
                  key={item.to}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium pointer-events-none opacity-40"
                >
                  <span className="shrink-0 opacity-70"><item.icon className="size-5" /></span>
                  <span>{item.label}</span>
                </div>
              )
            )}
          </div>
        </nav>

        {/* Project nav */}
        <nav className="px-3">
          <div className="mb-2 px-3 text-xs font-medium uppercase tracking-widest text-text-tertiary">
            Project
          </div>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium no-underline transition-all',
                'duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
                isActive
                  ? 'bg-accent-muted text-primary'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary" />
                )}
                <Info className="size-5" />
                <span>About</span>
              </>
            )}
          </NavLink>
        </nav>

        {/* User block */}
        <div className="mt-auto border-t border-border px-3 py-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent-hover text-sm font-bold text-text-on-accent">
              TM
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground truncate">Tony Mikityuk</div>
              <div className="text-xs text-text-tertiary">Program Manager</div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
