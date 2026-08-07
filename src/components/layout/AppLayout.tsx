import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, Radio } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { isMockMode } from '@/services/n8n'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50 dark:bg-ink-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-ink-100 bg-white px-4 dark:border-ink-800 dark:bg-ink-900 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-ink-500 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-ink-900 dark:bg-brand-500">
              <Radio className="h-3 w-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-ink-900 dark:text-white">Pulse CRM</span>
          </div>
          <ThemeToggle className="ml-auto" />
        </header>

        {import.meta.env.DEV && isMockMode && (
          <div className="flex h-8 shrink-0 items-center justify-center gap-2 bg-ink-900 px-4 text-center text-[11px] font-medium text-white">
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-warm-500" />
            <span className="truncate">MOCK MODE — respostas de IA são simuladas</span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
