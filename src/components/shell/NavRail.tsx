import { NavLink } from 'react-router-dom'
import { useAppState } from '../../data/store'

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
    <nav className="nav-rail">
      <div className="nav-rail-header">
        <span className="nav-rail-title">BPCC</span>
      </div>
      <ul className="nav-rail-links">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `nav-rail-link${isActive ? ' nav-rail-link--active' : ''}`
              }
              end={item.to === '/'}
            >
              <span className="nav-rail-link-label">{item.label}</span>
              {item.badge !== undefined && (
                <span className="nav-rail-badge">{item.badge}</span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="nav-rail-footer">
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `nav-rail-link${isActive ? ' nav-rail-link--active' : ''}`
          }
        >
          About
        </NavLink>
      </div>
    </nav>
  )
}
