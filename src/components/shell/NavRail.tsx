import { NavLink } from 'react-router-dom'
import { useAppState } from '@/data/store'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
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

  const navItems: NavItem[] = [
    { to: '/', label: 'Overview' },
    { to: '/queue', label: 'Case Queue', badge: activeCases },
    { to: '/investigation', label: 'Investigation', badge: investigatingCases },
    { to: '/domains', label: 'Domains', badge: monitoredDomains },
    { to: '/enforcement', label: 'Enforcement', badge: activeActions },
  ]

  return (
    <nav className="flex w-56 flex-col shrink-0 bg-card border-r border-border">
      {/* Brand */}
      <div className="px-5 py-6">
        <span className="text-lg font-bold tracking-widest text-foreground">BPCC</span>
      </div>

      {/* Navigation links */}
      <div className="flex flex-1 flex-col gap-1 px-3 py-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between rounded-lg px-3 py-2 text-sm no-underline transition-colors duration-150',
                isActive
                  ? 'bg-primary/[0.14] text-primary font-medium'
                  : 'text-text-secondary hover:bg-surface-elevated/60 hover:text-foreground'
              )
            }
          >
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className={cn(
                'min-w-5 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none',
                'bg-surface-elevated text-text-secondary'
              )}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-3 py-3">
        <NavLink
          to="/about"
          className={({ isActive }) =>
            cn(
              'flex rounded-lg px-3 py-2 text-sm no-underline transition-colors duration-150',
              isActive
                ? 'bg-primary/[0.14] text-primary font-medium'
                : 'text-text-secondary hover:bg-surface-elevated/60 hover:text-foreground'
            )
          }
        >
          About
        </NavLink>
      </div>
    </nav>
  )
}
