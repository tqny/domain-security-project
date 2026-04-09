import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import NavRail from './NavRail'
import TopBar from './TopBar'
import MobileNav from './MobileNav'

export default function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const handleMobileNavChange = useCallback((open: boolean) => setMobileNavOpen(open), [])

  return (
    <>
      {/* Skip to content — visible on focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Desktop layout: sidebar + topbar + main via CSS Grid */}
      <div
        className="hidden md:grid min-h-screen min-h-dvh"
        style={{
          gridTemplateColumns: 'var(--sidebar-width) 1fr',
          gridTemplateRows: 'var(--topbar-height) 1fr',
          gridTemplateAreas: `"sidebar topbar" "sidebar main"`,
        }}
      >
        <NavRail />
        <TopBar />
        <main
          className="overflow-y-auto bg-background p-6 lg:p-8"
          style={{ gridArea: 'main' }}
          id="main-content"
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile layout: topbar + main, no sidebar */}
      <div className="flex flex-col min-h-screen min-h-dvh md:hidden">
        <TopBar onMenuClick={() => setMobileNavOpen(true)} />
        <MobileNav open={mobileNavOpen} onOpenChange={handleMobileNavChange} />
        <main
          className="flex-1 overflow-y-auto bg-background p-4"
        >
          <Outlet />
        </main>
      </div>
    </>
  )
}
