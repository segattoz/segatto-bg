import { useMemo } from 'react'
import { useCrmStore } from '@/store/crmStore'
import type { LeadAnalysis, LeadHistoryEntry } from '@/types'

export function useLeadHistory(leadId: string | undefined): LeadHistoryEntry[] {
  const history = useCrmStore((state) => state.history)
  return useMemo(
    () =>
      leadId
        ? history.filter((entry) => entry.leadId === leadId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        : [],
    [history, leadId],
  )
}

export function useLeadAnalyses(leadId: string | undefined): LeadAnalysis[] {
  const analyses = useCrmStore((state) => state.analyses)
  return useMemo(
    () =>
      leadId
        ? analyses.filter((a) => a.leadId === leadId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        : [],
    [analyses, leadId],
  )
}
