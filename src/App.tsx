import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { AppProvider } from '@/data/store'
import Layout from '@/components/shell/Layout'
import RequireScanData from '@/components/shell/RequireScanData'
import '@/styles/global.css'

// Lazy-loaded page components
const Overview = lazy(() => import('@/components/pages/Overview'))
const Queue = lazy(() => import('@/components/pages/Queue'))
const Investigation = lazy(() => import('@/components/pages/Investigation'))
const Domains = lazy(() => import('@/components/pages/Domains'))
const Enforcement = lazy(() => import('@/components/pages/Enforcement'))
const About = lazy(() => import('@/components/pages/About'))
const LiveScan = lazy(() => import('@/components/pages/LiveScan'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex max-w-md flex-col items-center text-center">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground">Page not found</h1>
        <p className="mb-6 text-sm text-text-secondary">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-text-on-accent transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:bg-accent-hover active:scale-[0.98]"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter basename="/domain-security-project">
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="live-scan" element={<Lazy><LiveScan /></Lazy>} />
            <Route path="about" element={<Lazy><About /></Lazy>} />
            <Route element={<RequireScanData />}>
              <Route index element={<Lazy><Overview /></Lazy>} />
              <Route path="queue" element={<Lazy><Queue /></Lazy>} />
              <Route path="investigation" element={<Lazy><Investigation /></Lazy>} />
              <Route path="domains" element={<Lazy><Domains /></Lazy>} />
              <Route path="enforcement" element={<Lazy><Enforcement /></Lazy>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
