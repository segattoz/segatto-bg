import { create } from 'zustand'
import type { Lead, LeadHistoryEntry, LeadInput, Meeting, MeetingInput, LeadAnalysis } from '@/types'
import { mockLeads, mockMeetings, mockLeadAnalyses, mockLeadHistory } from '@/data'

function recomputeRankings(leads: Lead[]): Lead[] {
  const sorted = [...leads].sort((a, b) => b.score - a.score)
  const rankById = new Map(sorted.map((lead, index) => [lead.id, index + 1]))
  return leads.map((lead) => ({ ...lead, ranking: rankById.get(lead.id) ?? lead.ranking }))
}

interface CrmState {
  leads: Lead[]
  meetings: Meeting[]
  analyses: LeadAnalysis[]
  history: LeadHistoryEntry[]

  createLead: (input: LeadInput) => Lead
  updateLead: (id: string, patch: Partial<Lead>) => Lead | null
  deleteLead: (id: string) => void

  createMeeting: (input: MeetingInput) => Meeting
  updateMeeting: (id: string, patch: Partial<Meeting>) => Meeting | null

  addHistory: (entry: Omit<LeadHistoryEntry, 'id' | 'createdAt'>) => LeadHistoryEntry
  addAnalysis: (analysis: Omit<LeadAnalysis, 'id' | 'createdAt'>) => LeadAnalysis
}

let idCounter = 0
function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}-${Date.now()}-${idCounter}`
}

export const useCrmStore = create<CrmState>((set) => ({
  leads: recomputeRankings(mockLeads),
  meetings: mockMeetings,
  analyses: mockLeadAnalyses,
  history: mockLeadHistory,

  createLead: (input) => {
    const now = new Date().toISOString()
    const lead: Lead = {
      ...input,
      id: nextId('lead'),
      userId: 'demo-user',
      ranking: null,
      previousRanking: null,
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({ leads: recomputeRankings([...state.leads, lead]) }))
    return lead
  },

  updateLead: (id, patch) => {
    let updated: Lead | null = null
    set((state) => {
      const leads = state.leads.map((lead) => {
        if (lead.id !== id) return lead
        updated = { ...lead, ...patch, updatedAt: new Date().toISOString() }
        return updated
      })
      return { leads: recomputeRankings(leads) }
    })
    return updated
  },

  deleteLead: (id) => {
    set((state) => ({ leads: state.leads.filter((lead) => lead.id !== id) }))
  },

  createMeeting: (input) => {
    const now = new Date().toISOString()
    const meeting: Meeting = {
      ...input,
      id: nextId('meeting'),
      userId: 'demo-user',
      status: 'pendente',
      analysisSummary: null,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({ meetings: [meeting, ...state.meetings] }))
    return meeting
  },

  updateMeeting: (id, patch) => {
    let updated: Meeting | null = null
    set((state) => ({
      meetings: state.meetings.map((meeting) => {
        if (meeting.id !== id) return meeting
        updated = { ...meeting, ...patch, updatedAt: new Date().toISOString() }
        return updated
      }),
    }))
    return updated
  },

  addHistory: (entry) => {
    const record: LeadHistoryEntry = { ...entry, id: nextId('hist'), createdAt: new Date().toISOString() }
    set((state) => ({ history: [record, ...state.history] }))
    return record
  },

  addAnalysis: (analysis) => {
    const record: LeadAnalysis = { ...analysis, id: nextId('analysis'), createdAt: new Date().toISOString() }
    set((state) => ({ analyses: [record, ...state.analyses] }))
    return record
  },
}))

export function getStoreSnapshot() {
  return useCrmStore.getState()
}
