import { useCrmStore } from '@/store/crmStore'
import type { Lead } from '@/types'

/**
 * Reactive read of the leads list. In the prototype the store *is* the
 * mock backend, so this stays in sync automatically after any CRMService
 * write (create/update/applyMeetingAnalysis). A production build backed by
 * Supabase would instead source this from a query/subscription hook, but
 * the return shape given to components stays the same.
 */
export function useLeads(): Lead[] {
  return useCrmStore((state) => state.leads)
}

export function useLead(id: string | undefined): Lead | null {
  return useCrmStore((state) => state.leads.find((lead) => lead.id === id) ?? null)
}

export function useLeadsSortedByScore(): Lead[] {
  const leads = useLeads()
  return [...leads].sort((a, b) => b.score - a.score)
}
