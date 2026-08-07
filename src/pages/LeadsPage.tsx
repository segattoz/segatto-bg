import { useState } from 'react'
import type { ReactNode } from 'react'
import { List, KanbanSquare } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { LeadsTable } from '@/components/leads/LeadsTable'
import { KanbanBoard } from '@/components/pipeline/KanbanBoard'
import { cn } from '@/lib/cn'
import { useLeads } from '@/hooks/useLeads'
import { getCrmService } from '@/services/crmService'
import type { LeadStatus } from '@/types'

const crmService = getCrmService()

export function LeadsPage() {
  const leads = useLeads()
  const [view, setView] = useState<'list' | 'kanban'>('list')

  function handleStatusChange(leadId: string, status: LeadStatus) {
    void crmService.updateLead(leadId, { status })
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="CRM"
        subtitle="Todos os seus leads de seguro de vida, priorizados automaticamente por score."
        actions={
          <div className="flex items-center rounded-lg border border-ink-200 p-0.5 dark:border-ink-700">
            <ToggleButton active={view === 'list'} onClick={() => setView('list')} icon={<List className="h-3.5 w-3.5" />} label="Lista" />
            <ToggleButton
              active={view === 'kanban'}
              onClick={() => setView('kanban')}
              icon={<KanbanSquare className="h-3.5 w-3.5" />}
              label="Kanban"
            />
          </div>
        }
      />

      {view === 'list' ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <LeadsTable leads={leads} />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <KanbanBoard leads={leads} onStatusChange={handleStatusChange} />
        </div>
      )}
    </div>
  )
}

function ToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'bg-ink-900 text-white dark:bg-brand-500'
          : 'text-ink-500 hover:bg-ink-50 dark:text-ink-400 dark:hover:bg-ink-800',
      )}
    >
      {icon}
      {label}
    </button>
  )
}
