import { Outlet } from 'react-router-dom'
import NavRail from './NavRail'
import TopBar from './TopBar'

export default function Layout() {
  return (
    <div
      className="grid min-h-screen min-h-dvh"
      style={{
        gridTemplateColumns: 'var(--sidebar-width) 1fr',
        gridTemplateRows: 'var(--topbar-height) 1fr',
        gridTemplateAreas: `"sidebar topbar" "sidebar main"`,
      }}
    >
      <NavRail />
      <TopBar />
      <main
        className="overflow-y-auto bg-background p-8"
        style={{ gridArea: 'main' }}
        id="main-content"
      >
        <Outlet />
      </main>
    </div>
  )
}
