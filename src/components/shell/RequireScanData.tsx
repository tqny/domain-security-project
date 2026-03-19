import { Outlet, Link } from 'react-router-dom'
import { useAppState } from '@/data/store'
import { ShieldOff, Radar } from 'lucide-react'

export default function RequireScanData() {
  const { hasData } = useAppState()

  if (hasData) return <Outlet />

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-surface-alt">
          <ShieldOff className="size-8 text-text-tertiary" />
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
          No scan data yet
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-text-secondary">
          Run a Live Scan to detect suspicious domain variants and populate the
          workflow. The scanner generates variants, probes DNS, and enriches
          active domains with threat intelligence.
        </p>
        <Link
          to="/live-scan"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-text-on-accent transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:bg-accent-hover active:scale-[0.98]"
        >
          <Radar className="size-4" />
          Run Live Scan
        </Link>
      </div>
    </div>
  )
}
