import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { PinLayer } from '@/components/review/PinLayer'

export function Layout() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Outlet />
      </main>
      <PinLayer />
    </div>
  )
}
