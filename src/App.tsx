import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/data/store'
import Layout from '@/components/shell/Layout'
import Overview from '@/components/pages/Overview'
import Queue from '@/components/pages/Queue'
import Investigation from '@/components/pages/Investigation'
import Domains from '@/components/pages/Domains'
import Enforcement from '@/components/pages/Enforcement'
import About from '@/components/pages/About'
import '@/styles/global.css'

function App() {
  return (
    <BrowserRouter basename="/domain-security-project">
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="queue" element={<Queue />} />
            <Route path="investigation" element={<Investigation />} />
            <Route path="domains" element={<Domains />} />
            <Route path="enforcement" element={<Enforcement />} />
            <Route path="about" element={<About />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
