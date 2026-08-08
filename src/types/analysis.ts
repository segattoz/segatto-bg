import type { LeadTemperature } from './lead'

/** Persisted row mirroring the `lead_analysis` table. */
export interface LeadAnalysis {
  id: string
  leadId: string
  meetingId: string
  scoreBefore: number
  scoreAfter: number
  temperatureBefore: LeadTemperature
  temperatureAfter: LeadTemperature
  priority: number
  confidence: number
  reason: string
  nextAction: string | null
  nextActionDeadline: string | null
  insights: string[]
  /** Insurance products/coverages the analysis judged relevant for this lead. */
  recommendedProducts: string[]
  createdAt: string
}

export type LeadHistoryType =
  | 'meeting'
  | 'score_change'
  | 'temperature_change'
  | 'status_change'
  | 'note'
  | 'ai_analysis'

export interface LeadHistoryEntry {
  id: string
  leadId: string
  type: LeadHistoryType
  description: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

// ---------------------------------------------------------------------------
// n8n contract
// ---------------------------------------------------------------------------

/** Minimal lead snapshot sent to n8n — no unrelated CRM fields. */
export interface N8nLeadSnapshot {
  id: string
  full_name: string
  status: string
  current_score: number
  current_temperature: LeadTemperature
}

export interface N8nAnalysisRequest {
  meeting: {
    id: string
    title: string
    date: string
    minutes: string
  }
  audio: {
    filename: string
    mime_type: string
    base64: string
  }
  leads: N8nLeadSnapshot[]
}

export interface N8nLeadResult {
  lead_id: string
  score: number
  temperature: LeadTemperature
  priority: number
  confidence: number
  reason: string
  next_action: string
  next_action_deadline: string | null
  insights: string[]
  /** Life insurance products/coverages recommended for this lead based on the meeting. */
  recommended_products: string[]
}

export interface N8nAnalysisResponse {
  analysis_id: string
  summary: string
  leads: N8nLeadResult[]
}

/** Client-side view combining the n8n result with before/after ranking deltas. */
export interface RankingChange {
  leadId: string
  fullName: string
  scoreBefore: number
  scoreAfter: number
  temperatureBefore: LeadTemperature
  temperatureAfter: LeadTemperature
  rankingBefore: number | null
  rankingAfter: number
  priority: number
  confidence: number
  reason: string
  nextAction: string
  nextActionDeadline: string | null
  insights: string[]
  recommendedProducts: string[]
}

export interface MeetingAnalysisResult {
  analysisId: string
  summary: string
  changes: RankingChange[]
}
