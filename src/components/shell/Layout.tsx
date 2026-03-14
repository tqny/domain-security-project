import { Outlet } from 'react-router-dom'
import NavRail from './NavRail'

export default function Layout() {
  return (
    <div className="app-layout">
      <NavRail />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
