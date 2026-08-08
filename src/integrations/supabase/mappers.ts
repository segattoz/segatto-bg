import type { Lead, LeadAnalysis, LeadHistoryEntry, Meeting } from '@/types'

// Row shapes mirror supabase/migrations/0001_init.sql column-for-column.

export interface LeadRow {
  id: string
  user_id: string
  full_name: string
  job_title: string | null
  phone: string | null
  email: string | null
  source: string | null
  referred_by: string | null
  status: Lead['status']
  temperature: Lead['temperature']
  score: number
  ranking: number | null
  previous_ranking: number | null
  insights: string[] | null
  recommended_products: string[] | null
  next_action: string | null
  next_action_deadline: string | null
  responsible_name: string | null
  last_meeting_at: string | null
  created_at: string
  updated_at: string
}

export interface MeetingRow {
  id: string
  user_id: string
  title: string
  meeting_date: string
  meeting_time: string
  participants: string[] | null
  minutes: string
  observations: string | null
  status: Meeting['status']
  analysis_summary: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface LeadAnalysisRow {
  id: string
  lead_id: string
  meeting_id: string
  score_before: number
  score_after: number
  temperature_before: Lead['temperature']
  temperature_after: Lead['temperature']
  priority: number
  confidence: number
  reason: string
  next_action: string | null
  next_action_deadline: string | null
  insights: string[] | null
  recommended_products: string[] | null
  created_at: string
}

export interface LeadHistoryRow {
  id: string
  lead_id: string
  type: LeadHistoryEntry['type']
  description: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export function leadFromRow(row: LeadRow): Lead {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    jobTitle: row.job_title,
    phone: row.phone,
    email: row.email,
    source: row.source,
    referredBy: row.referred_by,
    status: row.status,
    temperature: row.temperature,
    score: row.score,
    ranking: row.ranking,
    previousRanking: row.previous_ranking,
    insights: row.insights ?? [],
    recommendedProducts: row.recommended_products ?? [],
    nextAction: row.next_action,
    nextActionDeadline: row.next_action_deadline,
    responsibleName: row.responsible_name,
    lastMeetingAt: row.last_meeting_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function leadToRow(lead: Partial<Lead>): Partial<LeadRow> {
  const row: Partial<LeadRow> = {}
  if (lead.fullName !== undefined) row.full_name = lead.fullName
  if (lead.jobTitle !== undefined) row.job_title = lead.jobTitle
  if (lead.phone !== undefined) row.phone = lead.phone
  if (lead.email !== undefined) row.email = lead.email
  if (lead.source !== undefined) row.source = lead.source
  if (lead.referredBy !== undefined) row.referred_by = lead.referredBy
  if (lead.status !== undefined) row.status = lead.status
  if (lead.temperature !== undefined) row.temperature = lead.temperature
  if (lead.score !== undefined) row.score = lead.score
  if (lead.ranking !== undefined) row.ranking = lead.ranking
  if (lead.previousRanking !== undefined) row.previous_ranking = lead.previousRanking
  if (lead.insights !== undefined) row.insights = lead.insights
  if (lead.recommendedProducts !== undefined) row.recommended_products = lead.recommendedProducts
  if (lead.nextAction !== undefined) row.next_action = lead.nextAction
  if (lead.nextActionDeadline !== undefined) row.next_action_deadline = lead.nextActionDeadline
  if (lead.responsibleName !== undefined) row.responsible_name = lead.responsibleName
  if (lead.lastMeetingAt !== undefined) row.last_meeting_at = lead.lastMeetingAt
  return row
}

export function meetingFromRow(row: MeetingRow, leadIds: string[]): Meeting {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    meetingDate: row.meeting_date,
    meetingTime: row.meeting_time,
    participants: row.participants ?? [],
    leadIds,
    minutes: row.minutes,
    observations: row.observations,
    status: row.status,
    analysisSummary: row.analysis_summary,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function meetingToRow(meeting: Partial<Meeting>): Partial<MeetingRow> {
  const row: Partial<MeetingRow> = {}
  if (meeting.title !== undefined) row.title = meeting.title
  if (meeting.meetingDate !== undefined) row.meeting_date = meeting.meetingDate
  if (meeting.meetingTime !== undefined) row.meeting_time = meeting.meetingTime
  if (meeting.participants !== undefined) row.participants = meeting.participants
  if (meeting.minutes !== undefined) row.minutes = meeting.minutes
  if (meeting.observations !== undefined) row.observations = meeting.observations
  if (meeting.status !== undefined) row.status = meeting.status
  if (meeting.analysisSummary !== undefined) row.analysis_summary = meeting.analysisSummary
  if (meeting.errorMessage !== undefined) row.error_message = meeting.errorMessage
  return row
}

export function analysisFromRow(row: LeadAnalysisRow): LeadAnalysis {
  return {
    id: row.id,
    leadId: row.lead_id,
    meetingId: row.meeting_id,
    scoreBefore: row.score_before,
    scoreAfter: row.score_after,
    temperatureBefore: row.temperature_before,
    temperatureAfter: row.temperature_after,
    priority: row.priority,
    confidence: Number(row.confidence),
    reason: row.reason,
    nextAction: row.next_action,
    nextActionDeadline: row.next_action_deadline,
    insights: row.insights ?? [],
    recommendedProducts: row.recommended_products ?? [],
    createdAt: row.created_at,
  }
}

export function historyFromRow(row: LeadHistoryRow): LeadHistoryEntry {
  return {
    id: row.id,
    leadId: row.lead_id,
    type: row.type,
    description: row.description,
    metadata: row.metadata,
    createdAt: row.created_at,
  }
}
