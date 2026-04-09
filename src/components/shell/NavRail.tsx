import { NavLink } from 'react-router-dom'
import { useAppState } from '@/data/store'
import { cn } from '@/lib/utils'
import { workflowItems } from './nav-items'
import {
  Info,
  Radar,
} from 'lucide-react'

export default function NavRail() {
  const { hasData } = useAppState()

  return (
    <aside
      className="flex flex-col bg-surface border-r border-border sticky top-0 h-screen h-dvh overflow-y-auto"
      style={{ gridArea: 'sidebar', zIndex: 'var(--z-sticky)' }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="group flex items-center gap-3 px-6 py-6 mb-2 cursor-default">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary transition-all duration-300 ease-[var(--ease-standard)] group-hover:scale-110 group-hover:shadow-[0_0_16px_rgba(232,168,56,0.4)] group-hover:rotate-[-6deg]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-[18px] text-text-on-accent transition-transform duration-300 group-hover:scale-110">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <span className="text-lg font-bold tracking-tight text-foreground transition-all duration-300 group-hover:text-primary group-hover:tracking-normal">Sentinel</span>
      </div>

      {/* Live Scan — promoted to top */}
      <nav className="px-3 mb-6">
        <NavLink
          to="/live-scan"
          className={({ isActive }) =>
            cn(
              'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-all',
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
                <Radar className="size-[18px]" />
              </span>
              <span>Live Scan</span>
            </>
          )}
        </NavLink>
      </nav>

      {/* Workflow nav */}
      <nav className="px-3 mb-6">
        <div className="mb-2 px-3 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Workflow
        </div>
        {!hasData && (
          <div className="mb-2 px-3 text-[10px] text-text-tertiary/60">
            Scan to unlock
          </div>
        )}
        <div className="flex flex-col gap-1">
          {workflowItems.map((item) =>
            hasData ? (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-all',
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
                    <span className="flex items-center gap-3">
                      <span className={cn('shrink-0', isActive ? 'opacity-100' : 'opacity-70')}>
                        <item.icon className="size-[18px]" />
                      </span>
                      <span>{item.label}</span>
                    </span>
                  </>
                )}
              </NavLink>
            ) : (
              <div
                key={item.to}
                className="group relative flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium pointer-events-none opacity-40"
              >
                <span className="flex items-center gap-3">
                  <span className="shrink-0 opacity-70">
                    <item.icon className="size-[18px]" />
                  </span>
                  <span>{item.label}</span>
                </span>
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
              'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-all',
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
                <Info className="size-[18px]" />
              </span>
              <span>About</span>
            </>
          )}
        </NavLink>
      </nav>

      {/* User block */}
      <div className="mt-auto border-t border-border px-3 py-4">
        <div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-default transition-colors duration-200 hover:bg-surface-hover">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent-hover text-sm font-bold text-text-on-accent transition-all duration-300 ease-[var(--ease-standard)] group-hover:scale-110 group-hover:shadow-[0_0_14px_rgba(232,168,56,0.3)] group-hover:rotate-3">
            TM
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground truncate transition-colors duration-200 group-hover:text-primary">Tony Mikityuk</div>
            <div className="text-xs text-text-tertiary transition-colors duration-200 group-hover:text-text-secondary">Program Manager</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
