import type {
  Lead,
  LeadInput,
  LeadHistoryEntry,
  LeadAnalysis,
  Meeting,
  MeetingInput,
  MeetingAnalysisResult,
} from '@/types'

/**
 * Conceptual CRM abstraction. Every screen in the app talks to this
 * interface, never directly to Supabase or a mocked store. That keeps the
 * commercial rules (ranking, scoring, pipeline movement, meeting analysis)
 * decoupled from *where* the data actually lives — today that's an
 * in-memory mock store, tomorrow it could be Supabase, or a sync layer on
 * top of HubSpot / Pipedrive / RD Station / Salesforce.
 */
export interface CRMService {
  getLeads(): Promise<Lead[]>
  getLead(id: string): Promise<Lead | null>
  createLead(input: LeadInput): Promise<Lead>
  updateLead(id: string, patch: Partial<Lead>): Promise<Lead | null>
  updateLeadScore(
    id: string,
    fields: { score: number; temperature: Lead['temperature']; ranking: number | null },
  ): Promise<Lead | null>

  getMeetings(): Promise<Meeting[]>
  getMeeting(id: string): Promise<Meeting | null>
  createMeeting(input: MeetingInput): Promise<Meeting>
  updateMeeting(id: string, patch: Partial<Meeting>): Promise<Meeting | null>

  getLeadAnalyses(leadId: string): Promise<LeadAnalysis[]>
  getLeadHistory(leadId: string): Promise<LeadHistoryEntry[]>
  addLeadHistory(entry: Omit<LeadHistoryEntry, 'id' | 'createdAt'>): Promise<LeadHistoryEntry>

  /**
   * Applies a fully-processed meeting analysis: writes lead_analysis rows,
   * lead_history events, updates each lead's score/temperature/ranking and
   * marks the meeting as processed. Returns the ranking deltas the UI needs
   * to render the "before vs after" comparison.
   */
  applyMeetingAnalysis(meetingId: string, response: import('@/types').N8nAnalysisResponse): Promise<MeetingAnalysisResult>
}

export { mockCrmService } from './mockCrmService'
export { supabaseCrmService } from './supabaseCrmService'

import { isSupabaseConfigured } from '@/integrations/supabase/client'
import { mockCrmService } from './mockCrmService'
import { supabaseCrmService } from './supabaseCrmService'

/** Resolves the active CRM implementation for this environment. */
export function getCrmService(): CRMService {
  return isSupabaseConfigured ? supabaseCrmService : mockCrmService
}
