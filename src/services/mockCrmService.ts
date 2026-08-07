import type { MeetingAnalysisResult, N8nAnalysisResponse, RankingChange } from '@/types'
import { TEMPERATURE_LABELS } from '@/types'
import { useCrmStore } from '@/store/crmStore'
import { delay } from '@/lib/async'
import type { CRMService } from './crmService'

const LATENCY = 150

/**
 * In-memory implementation of {@link CRMService}, backed by the Zustand
 * store seeded with mock data. Stands in for a real backend during the
 * prototype phase — every method is async so swapping in `supabaseCrmService`
 * later requires no changes at the call sites.
 */
export const mockCrmService: CRMService = {
  async getLeads() {
    await delay(LATENCY)
    return useCrmStore.getState().leads
  },

  async getLead(id) {
    await delay(LATENCY)
    return useCrmStore.getState().leads.find((lead) => lead.id === id) ?? null
  },

  async createLead(input) {
    await delay(LATENCY)
    return useCrmStore.getState().createLead(input)
  },

  async updateLead(id, patch) {
    await delay(LATENCY)
    return useCrmStore.getState().updateLead(id, patch)
  },

  async updateLeadScore(id, fields) {
    await delay(LATENCY)
    return useCrmStore.getState().updateLead(id, fields)
  },

  async getMeetings() {
    await delay(LATENCY)
    return useCrmStore.getState().meetings
  },

  async getMeeting(id) {
    await delay(LATENCY)
    return useCrmStore.getState().meetings.find((meeting) => meeting.id === id) ?? null
  },

  async createMeeting(input) {
    await delay(LATENCY)
    return useCrmStore.getState().createMeeting(input)
  },

  async updateMeeting(id, patch) {
    await delay(LATENCY)
    return useCrmStore.getState().updateMeeting(id, patch)
  },

  async getLeadAnalyses(leadId) {
    await delay(LATENCY)
    return useCrmStore
      .getState()
      .analyses.filter((analysis) => analysis.leadId === leadId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  async getLeadHistory(leadId) {
    await delay(LATENCY)
    return useCrmStore
      .getState()
      .history.filter((entry) => entry.leadId === leadId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  async addLeadHistory(entry) {
    await delay(LATENCY)
    return useCrmStore.getState().addHistory(entry)
  },

  async applyMeetingAnalysis(meetingId, response) {
    await delay(LATENCY)
    return applyAnalysis(meetingId, response)
  },
}

function applyAnalysis(meetingId: string, response: N8nAnalysisResponse): MeetingAnalysisResult {
  const store = useCrmStore.getState()
  const meeting = store.meetings.find((m) => m.id === meetingId)
  if (!meeting) {
    throw new Error(`Reunião ${meetingId} não encontrada`)
  }

  const changes: RankingChange[] = []

  for (const result of response.leads) {
    const lead = store.leads.find((l) => l.id === result.lead_id)
    if (!lead) continue

    const scoreBefore = lead.score
    const temperatureBefore = lead.temperature
    const rankingBefore = lead.ranking

    const updated = store.updateLead(lead.id, {
      score: result.score,
      temperature: result.temperature,
      previousRanking: rankingBefore,
      insights: result.insights,
      nextAction: result.next_action,
      nextActionDeadline: result.next_action_deadline,
      lastMeetingAt: meeting.meetingDate,
    })
    if (!updated) continue

    store.addAnalysis({
      leadId: lead.id,
      meetingId,
      scoreBefore,
      scoreAfter: result.score,
      temperatureBefore,
      temperatureAfter: result.temperature,
      priority: result.priority,
      confidence: result.confidence,
      reason: result.reason,
      nextAction: result.next_action,
      nextActionDeadline: result.next_action_deadline,
      insights: result.insights,
    })

    store.addHistory({
      leadId: lead.id,
      type: 'ai_analysis',
      description: `Análise de IA processada a partir do áudio da reunião "${meeting.title}"`,
      metadata: { meetingId, reason: result.reason },
    })

    if (scoreBefore !== result.score) {
      store.addHistory({
        leadId: lead.id,
        type: 'score_change',
        description: `Score alterado de ${scoreBefore} para ${result.score}`,
        metadata: { before: scoreBefore, after: result.score },
      })
    }

    if (temperatureBefore !== result.temperature) {
      store.addHistory({
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

  store.updateMeeting(meetingId, {
    status: 'processada',
    analysisSummary: response.summary,
    errorMessage: null,
  })

  changes.sort((a, b) => a.priority - b.priority)

  return { analysisId: response.analysis_id, summary: response.summary, changes }
}
