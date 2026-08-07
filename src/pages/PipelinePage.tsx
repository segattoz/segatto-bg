import { PageHeader } from '@/components/layout/PageHeader'
import { KanbanBoard } from '@/components/pipeline/KanbanBoard'
import { useLeads } from '@/hooks/useLeads'
import { getCrmService } from '@/services/crmService'
import type { LeadStatus } from '@/types'

const crmService = getCrmService()

export function PipelinePage() {
  const leads = useLeads()

  function handleStatusChange(leadId: string, status: LeadStatus) {
    void crmService.updateLead(leadId, { status })
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Pipeline" subtitle="Arraste os leads entre as etapas do funil comercial." />
      <div className="flex-1 overflow-hidden">
        <KanbanBoard leads={leads} onStatusChange={handleStatusChange} />
      </div>
    </div>
  )
}
