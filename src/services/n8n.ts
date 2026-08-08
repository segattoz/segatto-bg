import type { Lead, Meeting, N8nAnalysisRequest, N8nAnalysisResponse, N8nLeadResult } from '@/types'
import { temperatureFromScore } from '@/types'
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client'
import { delay } from '@/lib/async'

const WEBHOOK_URL = import.meta.env.VITE_N8N_ANALYZE_MEETING_WEBHOOK as string | undefined
const USE_EDGE_FUNCTION_PROXY = import.meta.env.VITE_USE_EDGE_FUNCTION_PROXY === 'true'

/**
 * MOCK MODE is active whenever no real n8n webhook is configured. The rest
 * of the app never checks this directly — it just calls `analyzeMeeting`
 * and gets back a well-formed N8nAnalysisResponse either way.
 */
export const isMockMode = !WEBHOOK_URL && !(USE_EDGE_FUNCTION_PROXY && isSupabaseConfigured)

export function buildAnalysisRequest(
  meeting: Pick<Meeting, 'id' | 'title' | 'meetingDate' | 'minutes'>,
  leads: Lead[],
  audio: { filename: string; mimeType: string; base64: string },
): N8nAnalysisRequest {
  return {
    meeting: {
      id: meeting.id,
      title: meeting.title,
      date: meeting.meetingDate,
      minutes: meeting.minutes,
    },
    audio: {
      filename: audio.filename,
      mime_type: audio.mimeType,
      base64: audio.base64,
    },
    leads: leads.map((lead) => ({
      id: lead.id,
      full_name: lead.fullName,
      status: lead.status,
      current_score: lead.score,
      current_temperature: lead.temperature,
    })),
  }
}

/**
 * Sends the meeting + audio payload for analysis.
 *
 * Preferred production path: Frontend -> Supabase Edge Function -> n8n,
 * so the webhook URL/secret never reaches the browser. Set
 * VITE_USE_EDGE_FUNCTION_PROXY=true (with Supabase configured) to route
 * through supabase/functions/analyze-meeting.
 *
 * Prototype fallback: call the n8n webhook directly from the browser.
 * If neither is configured, MOCK MODE returns a synthetic response after
 * a short delay so the full flow can be demoed end-to-end.
 */
export async function analyzeMeeting(request: N8nAnalysisRequest): Promise<N8nAnalysisResponse> {
  if (USE_EDGE_FUNCTION_PROXY && isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.functions.invoke<N8nAnalysisResponse>('analyze-meeting', {
      body: request,
    })
    if (error) throw error
    if (!data) throw new Error('Edge Function retornou uma resposta vazia')
    return data
  }

  if (WEBHOOK_URL) {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!res.ok) {
      throw new Error(`n8n respondeu com status ${res.status}`)
    }
    return (await res.json()) as N8nAnalysisResponse
  }

  return generateMockAnalysisResponse(request)
}

// ---------------------------------------------------------------------------
// Mock analysis generator
// ---------------------------------------------------------------------------

const POSITIVE_TERMS = [
  'interesse',
  'interessad',
  'orçamento',
  'urgência',
  'urgente',
  'aprovad',
  'decisor',
  'fechar',
  'contratar',
  'gostou',
  'avanç',
  'assin',
  'capital segurado',
  'apólice',
  'cobertura',
  'beneficiári',
]

const NEGATIVE_TERMS = [
  'sem urgência',
  'não demonstrou',
  'financeiro',
  'concorrente',
  'cancelar',
  'desistiu',
  'perdido',
  'não possui',
  'sem orçamento',
  'avaliando',
  'carência',
  'doença preexistente',
  'prêmio alto',
]

/** Keyword -> product recommendation. Checked in order against the meeting window. */
const RECOMMENDATION_RULES: { keywords: string[]; product: string }[] = [
  { keywords: ['invalidez'], product: 'Cobertura por Invalidez Funcional por Doença (IFPD)' },
  {
    keywords: ['financiamento', 'imóvel', 'imobiliário', 'prestamista'],
    product: 'Seguro Prestamista atrelado ao financiamento',
  },
  { keywords: ['doença grave', 'doenças graves'], product: 'Cobertura por Doenças Graves' },
  { keywords: ['filho', 'filhos', 'educação'], product: 'Seguro Educacional para os filhos' },
  { keywords: ['acidente', 'acidental'], product: 'Cobertura por Morte Acidental' },
  { keywords: ['sócio', 'sócios', 'key-man', 'empresarial'], product: 'Seguro de Vida Individual Empresarial (Key-Man)' },
]

function findWindow(text: string, term: string, radius = 220): string {
  const idx = text.toLowerCase().indexOf(term.toLowerCase())
  if (idx === -1) return text
  const start = Math.max(0, idx - radius)
  const end = Math.min(text.length, idx + term.length + radius)
  return text.slice(start, end)
}

function countMatches(text: string, terms: string[]): { count: number; hits: string[] } {
  const lower = text.toLowerCase()
  const hits = terms.filter((term) => lower.includes(term))
  return { count: hits.length, hits }
}

/**
 * Suggests which life insurance products/coverages make sense for this lead
 * based on what was actually said around their name in the meeting, plus a
 * baseline capital segurado scaled to how qualified the lead looks so far.
 */
function buildRecommendations(window: string, score: number): string[] {
  const lower = window.toLowerCase()
  const products = RECOMMENDATION_RULES.filter((rule) => rule.keywords.some((k) => lower.includes(k))).map(
    (rule) => rule.product,
  )

  const suggestedCapital = score >= 70 ? 'R$ 500 mil' : score >= 40 ? 'R$ 250 mil' : 'R$ 100 mil'
  products.unshift(`Seguro de Vida Individual com capital segurado sugerido de ${suggestedCapital}`)

  return [...new Set(products)].slice(0, 4)
}

function buildReason(fullName: string, positiveHits: string[], negativeHits: string[], delta: number): string {
  if (delta > 0 && positiveHits.length > 0) {
    return `${fullName} demonstrou sinais positivos na reunião (${positiveHits.slice(0, 2).join(', ')}), o que justifica o avanço no ranking.`
  }
  if (delta < 0 && negativeHits.length > 0) {
    return `${fullName} apresentou sinais de menor prioridade na reunião (${negativeHits.slice(0, 2).join(', ')}), reduzindo a pontuação.`
  }
  return `Nenhuma mudança relevante identificada para ${fullName} nesta reunião; mantendo classificação atual.`
}

function buildNextAction(temperature: Lead['temperature']): { action: string; days: number } {
  if (temperature === 'hot') return { action: 'Enviar simulação de apólice e capital segurado', days: 1 }
  if (temperature === 'warm') return { action: 'Entrar em contato em 3 dias', days: 3 }
  return { action: 'Reengajar em 2 semanas', days: 14 }
}

function addDays(base: string, days: number): string {
  const date = new Date(`${base}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/**
 * Produces a plausible N8nAnalysisResponse by scanning the meeting minutes
 * for simple positive/negative signal words near each lead's name, and
 * deriving product recommendations from the same window. This is only used
 * in MOCK MODE (no n8n webhook configured) so the demo feels connected to
 * what was actually typed into the ata, not random.
 */
async function generateMockAnalysisResponse(request: N8nAnalysisRequest): Promise<N8nAnalysisResponse> {
  await delay(1000)

  const scored = request.leads.map((lead) => {
    const window = findWindow(request.meeting.minutes, lead.full_name)
    const positive = countMatches(window, POSITIVE_TERMS)
    const negative = countMatches(window, NEGATIVE_TERMS)
    const delta = positive.count * 7 - negative.count * 6
    const score = Math.max(5, Math.min(99, lead.current_score + delta))
    const temperature = temperatureFromScore(score)
    const { action, days } = buildNextAction(temperature)

    const insights: string[] = []
    if (positive.hits.length > 0) insights.push(`Sinais positivos identificados: ${positive.hits.join(', ')}`)
    if (negative.hits.length > 0) insights.push(`Pontos de atenção identificados: ${negative.hits.join(', ')}`)
    if (insights.length === 0) insights.push('Sem novas informações relevantes nesta reunião')

    return {
      leadId: lead.id,
      delta,
      result: {
        lead_id: lead.id,
        score,
        temperature,
        confidence: Math.round((0.72 + Math.random() * 0.23) * 100) / 100,
        reason: buildReason(lead.full_name, positive.hits, negative.hits, delta),
        next_action: action,
        next_action_deadline: addDays(request.meeting.date, days),
        insights,
        recommended_products: buildRecommendations(window, score),
      },
    }
  })

  const ranked = [...scored].sort((a, b) => b.result.score - a.result.score)
  const priorityById = new Map(ranked.map((item, index) => [item.leadId, index + 1]))

  const leads: N8nLeadResult[] = scored.map((item) => ({
    ...item.result,
    priority: priorityById.get(item.leadId) ?? 99,
  }))

  const topGainer = [...scored].sort((a, b) => b.delta - a.delta)[0]
  const summary = topGainer
    ? `A reunião "${request.meeting.title}" indicou avanço para ${
        request.leads.find((l) => l.id === topGainer.leadId)?.full_name ?? 'um dos leads'
      }, com ${leads.length} lead(s) reavaliado(s) com base no relato enviado.`
    : `Reunião "${request.meeting.title}" processada com ${leads.length} lead(s) reavaliado(s).`

  return {
    analysis_id: `mock-${Date.now()}`,
    summary,
    leads,
  }
}
