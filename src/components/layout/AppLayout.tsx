import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { isMockMode } from '@/services/n8n'

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {import.meta.env.DEV && isMockMode && (
          <div className="flex h-8 shrink-0 items-center justify-center gap-2 bg-ink-900 text-[11px] font-medium text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warm-500" />
            MOCK MODE — VITE_N8N_ANALYZE_MEETING_WEBHOOK não configurado, respostas de IA são simuladas
          </div>
        )}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
