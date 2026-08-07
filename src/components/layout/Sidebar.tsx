import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, KanbanSquare, CalendarClock, Settings, Radio, LogOut } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Score'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/crm', label: 'CRM', icon: Users },
  { to: '/pipeline', label: 'Pipeline', icon: KanbanSquare },
  { to: '/reunioes', label: 'Reuniões', icon: CalendarClock },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const { user, isMockAuth, signOut } = useAuth()

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-ink-100 bg-white">
      <div className="flex h-16 items-center gap-2 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900">
          <Radio className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-ink-900">Pulse CRM</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
              )
            }
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink-100 p-3">
        {isMockAuth && (
          <div className="mb-3 rounded-lg bg-warm-50 px-3 py-2 text-[11px] font-medium text-warm-600 ring-1 ring-inset ring-warm-100">
            Modo demonstração · autenticação simulada
          </div>
        )}
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <Avatar name={user?.name ?? 'Usuário'} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-900">{user?.name}</p>
            <p className="truncate text-xs text-ink-400">{user?.email}</p>
          </div>
          <button
            onClick={() => void signOut()}
            className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
