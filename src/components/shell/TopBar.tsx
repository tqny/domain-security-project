import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppState } from '@/data/store'
import { Search, Bell, Menu, Sparkles } from 'lucide-react'

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/queue': 'Case Queue',
  '/investigation': 'Investigation',
  '/domains': 'Domain Portfolio',
  '/enforcement': 'Enforcement Tracker',
  '/about': 'About This Project',
  '/live-scan': 'Live Scan',
}

interface TopBarProps {
  onMenuClick?: () => void
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { state } = useAppState()
  const pageName = routeNames[location.pathname] ?? 'Dashboard'

  const pendingTriage = state.cases.filter((c) => c.triageStatus === 'pending')
  const pendingCount = pendingTriage.length

  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <header
      className="flex items-center justify-between bg-surface border-b border-border px-4 md:px-8 sticky top-0"
      style={{ gridArea: 'topbar', zIndex: 'var(--z-sticky)', height: 'var(--topbar-height)' }}
    >
      {/* Left — hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-3 text-sm min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="flex md:hidden size-10 items-center justify-center -ml-1 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-foreground transition-colors duration-[var(--duration-fast)]"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </button>
        )}
        <div className="flex items-center gap-2 min-w-0">
          <span className="hidden sm:inline text-text-secondary">Home</span>
          <span className="hidden sm:inline text-text-tertiary">/</span>
          <span className="text-foreground font-medium truncate">{pageName}</span>
        </div>
      </div>

      {/* Right — search + notifications */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Search — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 w-[200px] lg:w-[260px] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] focus-within:border-primary">
          <Search className="size-4 text-text-tertiary shrink-0" />
          <input
            type="text"
            placeholder="Search domains..."
            aria-label="Search domains"
            className="bg-transparent text-sm text-foreground placeholder:text-text-tertiary w-full outline-none"
          />
          <kbd className="hidden lg:inline-flex font-mono text-xs text-text-tertiary bg-surface-alt border border-border rounded px-1.5 py-0.5 leading-tight">
            /
          </kbd>
        </div>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="relative flex size-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover hover:text-foreground transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)]"
            aria-label={pendingCount > 0 ? `${pendingCount} pending triage` : 'Notifications'}
            aria-expanded={open}
          >
            <Bell className="size-[18px]" />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-border bg-surface shadow-floating overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="border-b border-border px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Notifications</span>
              </div>
              {pendingCount === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="size-5 text-text-tertiary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {pendingTriage.slice(0, 5).map((c) => (
                    <button
                      key={c.id}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-[var(--duration-fast)] hover:bg-surface-hover border-b border-border last:border-b-0"
                      onClick={() => { setOpen(false); navigate('/') }}
                    >
                      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-accent-muted">
                        <Sparkles className="size-3.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                        <p className="text-xs text-muted-foreground">Pending AI triage</p>
                      </div>
                    </button>
                  ))}
                  {pendingCount > 5 && (
                    <button
                      className="w-full px-4 py-2.5 text-xs text-primary hover:bg-surface-hover transition-colors text-center"
                      onClick={() => { setOpen(false); navigate('/') }}
                    >
                      View all {pendingCount} pending
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
