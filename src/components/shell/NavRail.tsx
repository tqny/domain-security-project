import { NavLink } from 'react-router-dom'
import { useAppState } from '@/data/store'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Inbox,
  Search as SearchIcon,
  Globe,
  Gavel,
  Info,
  Radar,
} from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  badge?: number
}

export default function NavRail() {
  const { state } = useAppState()

  const activeCases = state.cases.filter((c) => c.status !== 'Closed').length
  const investigatingCases = state.cases.filter((c) => c.status === 'Investigating').length
  const monitoredDomains = state.domains.length
  const activeActions = state.enforcementActions.filter(
    (a) => a.status !== 'Resolved' && a.status !== 'Denied'
  ).length

  const workflowItems: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="size-[18px]" /> },
    { to: '/queue', label: 'Case Queue', icon: <Inbox className="size-[18px]" />, badge: activeCases },
    { to: '/investigation', label: 'Investigation', icon: <SearchIcon className="size-[18px]" />, badge: investigatingCases },
    { to: '/domains', label: 'Domains', icon: <Globe className="size-[18px]" />, badge: monitoredDomains },
    { to: '/enforcement', label: 'Enforcement', icon: <Gavel className="size-[18px]" />, badge: activeActions },
  ]

  return (
    <aside
      className="flex flex-col bg-surface border-r border-border sticky top-0 h-screen h-dvh overflow-y-auto"
      style={{ gridArea: 'sidebar', zIndex: 'var(--z-sticky)' }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 mb-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-[18px] text-text-on-accent">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <span className="text-lg font-bold tracking-tight text-foreground">Sentinel</span>
      </div>

      {/* Workflow nav */}
      <nav className="px-3 mb-6">
        <div className="mb-2 px-3 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Workflow
        </div>
        <div className="flex flex-col gap-1">
          {workflowItems.map((item) => (
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
                  {/* Active accent bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary" />
                  )}
                  <span className="flex items-center gap-3">
                    <span className={cn('shrink-0', isActive ? 'opacity-100' : 'opacity-70')}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span className={cn(
                      'min-w-5 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none',
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'bg-surface-alt text-text-secondary'
                    )}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Tools nav */}
      <nav className="px-3 mb-6">
        <div className="mb-2 px-3 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Tools
        </div>
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
    </aside>
  )
}
