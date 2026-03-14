import { Outlet } from 'react-router-dom'
import NavRail from './NavRail'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-ambient p-4 md:p-5">
      <div className="flex flex-1 overflow-hidden rounded-2xl" style={{ boxShadow: 'var(--shadow-floating)' }}>
        <NavRail />
        <main className="flex-1 overflow-y-auto bg-background px-10 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
