import { supabase } from '@/integrations/supabase/client'
import {
  leadFromRow,
  leadToRow,
  meetingFromRow,
  meetingToRow,
  analysisFromRow,
  historyFromRow,
  type LeadRow,
  type MeetingRow,
  type LeadAnalysisRow,
  type LeadHistoryRow,
} from '@/integrations/supabase/mappers'
import type {
  Lead,
  LeadInput,
  LeadHistoryEntry,
  MeetingInput,
  MeetingAnalysisResult,
  N8nAnalysisResponse,
  RankingChange,
} from '@/types'
import { TEMPERATURE_LABELS } from '@/types'
import type { CRMService } from './crmService'

function db() {
  if (!supabase) {
    throw new Error('Supabase não está configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

async function fetchLeadIdsForMeetings(meetingIds: string[]): Promise<Map<string, string[]>> {
  if (meetingIds.length === 0) return new Map()
  const { data, error } = await db().from('meeting_leads').select('meeting_id, lead_id').in('meeting_id', meetingIds)
  if (error) throw error
  const map = new Map<string, string[]>()
  for (const row of data ?? []) {
    const list = map.get(row.meeting_id) ?? []
    list.push(row.lead_id)
    map.set(row.meeting_id, list)
  }
  return map
}

/**
 * Real Supabase-backed implementation of {@link CRMService}. Not exercised
 * by the prototype (which runs on `mockCrmService`) but kept structurally
 * complete so wiring a real Supabase project only requires setting the
 * VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY env vars — no call-site changes.
 */
export const supabaseCrmService: CRMService = {
  async getLeads() {
    const { data, error } = await db().from('leads').select('*').order('score', { ascending: false })
    if (error) throw error
    return (data as LeadRow[]).map(leadFromRow)
  },

  async getLead(id) {
    const { data, error } = await db().from('leads').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? leadFromRow(data as LeadRow) : null
  },

  async createLead(input: LeadInput) {
    const {
      data: { user },
    } = await db().auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await db()
      .from('leads')
      .insert({ ...leadToRow(input), user_id: user.id })
      .select()
      .single()
    if (error) throw error
    return leadFromRow(data as LeadRow)
  },

  async updateLead(id, patch) {
    const { data, error } = await db().from('leads').update(leadToRow(patch)).eq('id', id).select().maybeSingle()
    if (error) throw error
    return data ? leadFromRow(data as LeadRow) : null
  },

  async updateLeadScore(id, fields) {
    return supabaseCrmService.updateLead(id, fields)
  },

  async getMeetings() {
    const { data, error } = await db().from('meetings').select('*').order('meeting_date', { ascending: false })
    if (error) throw error
    const rows = data as MeetingRow[]
    const leadIdsByMeeting = await fetchLeadIdsForMeetings(rows.map((r) => r.id))
    return rows.map((row) => meetingFromRow(row, leadIdsByMeeting.get(row.id) ?? []))
  },

  async getMeeting(id) {
    const { data, error } = await db().from('meetings').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    if (!data) return null
    const leadIdsByMeeting = await fetchLeadIdsForMeetings([id])
    return meetingFromRow(data as MeetingRow, leadIdsByMeeting.get(id) ?? [])
  },

  async createMeeting(input: MeetingInput) {
    const {
      data: { user },
    } = await db().auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await db()
      .from('meetings')
      .insert({ ...meetingToRow(input), user_id: user.id, status: 'pendente' })
      .select()
      .single()
    if (error) throw error
    const meetingRow = data as MeetingRow

    if (input.leadIds.length > 0) {
      const { error: linkError } = await db()
        .from('meeting_leads')
        .insert(input.leadIds.map((leadId) => ({ meeting_id: meetingRow.id, lead_id: leadId })))
      if (linkError) throw linkError
    }

    return meetingFromRow(meetingRow, input.leadIds)
  },

  async updateMeeting(id, patch) {
    const { data, error } = await db().from('meetings').update(meetingToRow(patch)).eq('id', id).select().maybeSingle()
    if (error) throw error
    if (!data) return null
    const leadIdsByMeeting = await fetchLeadIdsForMeetings([id])
    return meetingFromRow(data as MeetingRow, leadIdsByMeeting.get(id) ?? patch.leadIds ?? [])
  },

  async getLeadAnalyses(leadId) {
    const { data, error } = await db()
      .from('lead_analysis')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as LeadAnalysisRow[]).map(analysisFromRow)
  },

  async getLeadHistory(leadId) {
    const { data, error } = await db()
      .from('lead_history')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as LeadHistoryRow[]).map(historyFromRow)
  },

  async addLeadHistory(entry: Omit<LeadHistoryEntry, 'id' | 'createdAt'>) {
    const { data, error } = await db()
      .from('lead_history')
      .insert({ lead_id: entry.leadId, type: entry.type, description: entry.description, metadata: entry.metadata })
      .select()
      .single()
    if (error) throw error
    return historyFromRow(data as LeadHistoryRow)
  },

  /**
   * Ideally this whole sequence runs inside a single Postgres function
   * (`rpc`) for atomicity. For the prototype it is a plain sequence of
   * awaited writes, mirroring the mock implementation's behaviour.
   */
  async applyMeetingAnalysis(meetingId: string, response: N8nAnalysisResponse): Promise<MeetingAnalysisResult> {
    const leads = await supabaseCrmService.getLeads()
    const changes: RankingChange[] = []

    for (const result of response.leads) {
      const lead = leads.find((l: Lead) => l.id === result.lead_id)
      if (!lead) continue

      const scoreBefore = lead.score
      const temperatureBefore = lead.temperature
      const rankingBefore = lead.ranking

      const updated = await supabaseCrmService.updateLead(lead.id, {
        score: result.score,
        temperature: result.temperature,
        previousRanking: rankingBefore,
        insights: result.insights,
        nextAction: result.next_action,
        nextActionDeadline: result.next_action_deadline,
      })
      if (!updated) continue

      await db().from('lead_analysis').insert({
        lead_id: lead.id,
        meeting_id: meetingId,
        score_before: scoreBefore,
        score_after: result.score,
        temperature_before: temperatureBefore,
        temperature_after: result.temperature,
        priority: result.priority,
        confidence: result.confidence,
        reason: result.reason,
        next_action: result.next_action,
        next_action_deadline: result.next_action_deadline,
        insights: result.insights,
      })

      await supabaseCrmService.addLeadHistory({
        leadId: lead.id,
        type: 'ai_analysis',
        description: `Análise de IA processada a partir do áudio da reunião`,
        metadata: { meetingId, reason: result.reason },
      })

      if (scoreBefore !== result.score) {
        await supabaseCrmService.addLeadHistory({
          leadId: lead.id,
          type: 'score_change',
          description: `Score alterado de ${scoreBefore} para ${result.score}`,
          metadata: { before: scoreBefore, after: result.score },
        })
      }

      if (temperatureBefore !== result.temperature) {
        await supabaseCrmService.addLeadHistory({
          leadId: lead.id,
          type: 'temperature_change',
          description: `Temperatura alterada de ${TEMPERATURE_LABELS[temperatureBefore]} para ${TEMPERATURE_LABELS[result.temperature]}`,
          metadata: { before: temperatureBefore, after: result.temperature },
        })
      }

      changes.push({
        leadId: lead.id,
        companyName: lead.companyName,
        scoreBefore,
        scoreAfter: result.score,
        temperatureBefore,
        temperatureAfter: result.temperature,
        rankingBefore,
        rankingAfter: updated.ranking ?? 0,
        priority: result.priority,
        confidence: result.confidence,
        reason: result.reason,
        nextAction: result.next_action,
        nextActionDeadline: result.next_action_deadline,
        insights: result.insights,
      })
    }

    await supabaseCrmService.updateMeeting(meetingId, {
      status: 'processada',
      analysisSummary: response.summary,
      errorMessage: null,
    })

    changes.sort((a, b) => a.priority - b.priority)

    return { analysisId: response.analysis_id, summary: response.summary, changes }
  },
}
