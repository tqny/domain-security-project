import { useLocation } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/queue': 'Case Queue',
  '/investigation': 'Investigation',
  '/domains': 'Domain Portfolio',
  '/enforcement': 'Enforcement Tracker',
  '/about': 'About This Project',
}

export default function TopBar() {
  const location = useLocation()
  const pageName = routeNames[location.pathname] ?? 'Dashboard'

  return (
    <header
      className="flex items-center justify-between bg-surface border-b border-border px-8 sticky top-0"
      style={{ gridArea: 'topbar', zIndex: 'var(--z-sticky)' }}
    >
      {/* Left — breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-text-secondary">Home</span>
        <span className="text-text-tertiary">/</span>
        <span className="text-foreground font-medium">{pageName}</span>
      </div>

      {/* Right — search + notifications */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 w-[260px] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] focus-within:border-primary">
          <Search className="size-4 text-text-tertiary shrink-0" />
          <input
            type="text"
            placeholder="Search domains..."
            aria-label="Search domains"
            className="bg-transparent text-sm text-foreground placeholder:text-text-tertiary w-full outline-none"
          />
          <kbd className="hidden sm:inline-flex font-mono text-xs text-text-tertiary bg-surface-alt border border-border rounded px-1.5 py-0.5 leading-tight">
            /
          </kbd>
        </div>

        {/* Notifications */}
        <button
          className="relative flex size-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover hover:text-foreground transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)]"
          aria-label="Notifications"
        >
          <Bell className="size-[18px]" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive border-2 border-surface" />
        </button>
      </div>
    </header>
  )
}
