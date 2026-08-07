import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, KanbanSquare, CalendarClock, Settings, Radio, LogOut, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Score'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/crm', label: 'CRM', icon: Users },
  { to: '/pipeline', label: 'Pipeline', icon: KanbanSquare },
  { to: '/reunioes', label: 'Reuniões', icon: CalendarClock },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, isMockAuth, signOut } = useAuth()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/50 backdrop-blur-[2px] transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col border-r border-ink-100 bg-white transition-transform duration-300 ease-out',
          'dark:border-ink-800 dark:bg-ink-900',
          'lg:static lg:z-auto lg:w-64 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 px-5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 dark:bg-brand-500">
            <span className="absolute inset-0 -z-10 animate-glow-pulse rounded-lg bg-brand-500/40 blur-md" />
            <Radio className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-ink-900 dark:text-white">Pulse CRM</span>
          <button
            onClick={onClose}
            className="ml-auto rounded-md p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:py-2',
                  isActive
                    ? 'bg-ink-900 text-white dark:bg-brand-500'
                    : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white',
                )
              }
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 border-t border-ink-100 p-3 dark:border-ink-800">
          {isMockAuth && (
            <div className="mb-3 rounded-lg bg-warm-50 px-3 py-2 text-[11px] font-medium text-warm-600 ring-1 ring-inset ring-warm-100 dark:bg-warm-500/10 dark:text-warm-400 dark:ring-warm-500/20">
              Modo demonstração · autenticação simulada
            </div>
          )}
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <Avatar name={user?.name ?? 'Usuário'} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-900 dark:text-white">{user?.name}</p>
              <p className="truncate text-xs text-ink-400">{user?.email}</p>
            </div>
            <ThemeToggle />
            <button
              onClick={() => void signOut()}
              className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-white"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
