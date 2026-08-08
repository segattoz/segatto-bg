export type LeadTemperature = 'hot' | 'warm' | 'cold'

export type LeadStatus =
  | 'novo'
  | 'contato_inicial'
  | 'reuniao_agendada'
  | 'proposta'
  | 'negociacao'
  | 'fechado'
  | 'perdido'

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo',
  contato_inicial: 'Contato inicial',
  reuniao_agendada: 'Reunião agendada',
  proposta: 'Proposta enviada',
  negociacao: 'Em negociação',
  fechado: 'Apólice emitida',
  perdido: 'Não contratado',
}

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  'novo',
  'contato_inicial',
  'reuniao_agendada',
  'proposta',
  'negociacao',
  'fechado',
  'perdido',
]

export const TEMPERATURE_LABELS: Record<LeadTemperature, string> = {
  hot: 'Quente',
  warm: 'Morno',
  cold: 'Frio',
}

/**
 * Score/temperature bands used only to *render* a fallback badge when the
 * backend hasn't classified a lead yet. The n8n workflow is the source of
 * truth for temperature — the frontend never re-derives it once a real
 * value exists.
 */
export function temperatureFromScore(score: number): LeadTemperature {
  if (score >= 70) return 'hot'
  if (score >= 40) return 'warm'
  return 'cold'
}

export interface Lead {
  id: string
  userId: string
  /** Full name of the prospect — every lead is an individual (pessoa física). */
  fullName: string
  jobTitle: string | null
  phone: string | null
  email: string | null
  source: string | null
  /** Name of the person who referred this lead, when the channel was a personal referral. */
  referredBy: string | null
  status: LeadStatus
  temperature: LeadTemperature
  score: number
  ranking: number | null
  previousRanking: number | null
  insights: string[]
  /** Insurance products/coverages recommended for this lead by the last analysis. */
  recommendedProducts: string[]
  nextAction: string | null
  nextActionDeadline: string | null
  responsibleName: string | null
  lastMeetingAt: string | null
  createdAt: string
  updatedAt: string
}

export type LeadInput = Omit<
  Lead,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'ranking' | 'previousRanking'
>
