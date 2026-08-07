import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { TemperatureBadge } from '@/components/ui/Badge'
import { LEAD_STATUS_LABELS, LEAD_STATUS_ORDER } from '@/types'
import type { Lead, LeadStatus } from '@/types'

const COLUMN_ACCENT: Record<LeadStatus, string> = {
  novo: 'bg-ink-300',
  contato_inicial: 'bg-brand-400',
  reuniao_agendada: 'bg-brand-500',
  proposta: 'bg-warm-500',
  negociacao: 'bg-warm-600',
  fechado: 'bg-positive-500',
  perdido: 'bg-negative-500',
}

export function KanbanBoard({
  leads,
  onStatusChange,
}: {
  leads: Lead[]
  onStatusChange: (leadId: string, status: LeadStatus) => void
}) {
  const byStatus = new Map<LeadStatus, Lead[]>(LEAD_STATUS_ORDER.map((status) => [status, []]))
  for (const lead of leads) {
    byStatus.get(lead.status)?.push(lead)
  }
  for (const list of byStatus.values()) {
    list.sort((a, b) => b.score - a.score)
  }

  function handleDragEnd(result: DropResult) {
    const { destination, draggableId } = result
    if (!destination) return
    const newStatus = destination.droppableId as LeadStatus
    onStatusChange(draggableId, newStatus)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-full snap-x snap-mandatory gap-4 overflow-x-auto p-4 pt-4 sm:p-8 sm:pt-6">
        {LEAD_STATUS_ORDER.map((status) => {
          const columnLeads = byStatus.get(status) ?? []
          return (
            <div key={status} className="flex w-[78vw] shrink-0 snap-start flex-col sm:w-72">
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className={cn('h-2 w-2 rounded-full', COLUMN_ACCENT[status])} />
                <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">{LEAD_STATUS_LABELS[status]}</h3>
                <span className="ml-auto rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-500 dark:bg-ink-800 dark:text-ink-400">
                  {columnLeads.length}
                </span>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'flex-1 space-y-2 rounded-xl border border-dashed border-transparent p-1.5 transition-colors',
                      snapshot.isDraggingOver && 'border-brand-300 bg-brand-50/50 dark:border-brand-500/40 dark:bg-brand-500/10',
                    )}
                  >
                    {columnLeads.map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={cn(
                              'rounded-lg border border-ink-100 bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow dark:border-ink-800 dark:bg-ink-900',
                              dragSnapshot.isDragging && 'shadow-lg ring-2 ring-brand-200 dark:ring-brand-500/40',
                            )}
                          >
                            <Link
                              to={`/crm/${lead.id}`}
                              className="block text-sm font-semibold text-ink-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                            >
                              {lead.companyName}
                            </Link>
                            <p className="mt-0.5 truncate text-xs text-ink-400">{lead.responsibleName ?? lead.contactName}</p>
                            <div className="mt-2.5 flex items-center justify-between">
                              <TemperatureBadge temperature={lead.temperature} />
                              <span className="text-sm font-semibold tabular-nums text-ink-900 dark:text-white">{lead.score}</span>
                            </div>
                            {lead.nextAction && (
                              <p className="mt-2 truncate rounded-md bg-ink-50 px-2 py-1 text-[11px] text-ink-500 dark:bg-ink-800 dark:text-ink-400">
                                {lead.nextAction}
                              </p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
