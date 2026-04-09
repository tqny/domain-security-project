import {
  LayoutDashboard,
  Inbox,
  Search as SearchIcon,
  Globe,
  Gavel,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItemDef {
  to: string
  label: string
  icon: LucideIcon
}

export const workflowItems: NavItemDef[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/queue', label: 'Case Queue', icon: Inbox },
  { to: '/investigation', label: 'Investigation', icon: SearchIcon },
  { to: '/domains', label: 'Domains', icon: Globe },
  { to: '/enforcement', label: 'Enforcement', icon: Gavel },
]
