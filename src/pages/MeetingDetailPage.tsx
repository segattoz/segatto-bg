import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Users, CalendarClock, AlertTriangle, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { MeetingStatusBadge, TemperatureBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { AudioCapture, AnalyzingOverlay } from '@/components/meetings/AudioCapture'
import { AnalysisResult } from '@/components/meetings/AnalysisResult'
import { formatDate } from '@/lib/format'
import { useMeeting } from '@/hooks/useMeetings'
import { useLeads } from '@/hooks/useLeads'
import { useMeetingAnalyses } from '@/hooks/useMeetingAnalyses'
import { useMeetingAnalysis } from '@/hooks/useMeetingAnalysis'

export function MeetingDetailPage() {
  const { meetingId } = useParams<{ meetingId: string }>()
  const meeting = useMeeting(meetingId)
  const leads = useLeads()
  const pastAnalyses = useMeetingAnalyses(meetingId)

  const involvedLeads = leads.filter((l) => meeting?.leadIds.includes(l.id))
  const { phase, result, errorMessage, run, reset } = useMeetingAnalysis(
    meeting ?? { id: '', userId: '', title: '', meetingDate: '', meetingTime: '', participants: [], leadIds: [], minutes: '', observations: null, status: 'pendente', analysisSummary: null, errorMessage: null, createdAt: '', updatedAt: '' },
    involvedLeads,
  )

  if (!meeting) return <Navigate to="/reunioes" replace />

  const showAlreadyProcessed = meeting.status === 'processada' && phase === 'idle'

  return (
    <div className="p-4 sm:p-8">
      <Link
        to="/reunioes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar para reuniões
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-ink-900 dark:text-white sm:text-2xl">{meeting.title}</h1>
            <MeetingStatusBadge status={meeting.status} />
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-400">
            <CalendarClock className="h-3.5 w-3.5" />
            {formatDate(meeting.meetingDate)} às {meeting.meetingTime}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ata completa</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700 dark:text-ink-300">{meeting.minutes}</p>
              {meeting.observations && (
                <p className="mt-4 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-500 dark:bg-ink-800 dark:text-ink-400">
                  <strong className="font-medium text-ink-600 dark:text-ink-300">Observações: </strong>
                  {meeting.observations}
                </p>
              )}
            </CardBody>
          </Card>

          <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4 dark:border-brand-500/20 dark:bg-brand-500/5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <h2 className="text-sm font-semibold text-brand-700 dark:text-brand-300">Analisar reunião</h2>
            </div>

            {phase === 'error' && (
              <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-negative-100 px-4 py-3 text-sm text-negative-600 dark:bg-negative-500/10 dark:text-negative-400">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Falha ao processar a reunião</p>
                  <p className="mt-0.5 text-xs">{errorMessage}</p>
                </div>
              </div>
            )}

            {meeting.status === 'erro' && phase === 'idle' && meeting.errorMessage && (
              <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-negative-100 px-4 py-3 text-sm text-negative-600 dark:bg-negative-500/10 dark:text-negative-400">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Última tentativa falhou</p>
                  <p className="mt-0.5 text-xs">{meeting.errorMessage}</p>
                </div>
              </div>
            )}

            {phase === 'processing' && <AnalyzingOverlay />}

            {phase === 'done' && result && (
              <>
                <AnalysisResult result={result} />
                <Button variant="secondary" className="mt-4" onClick={reset}>
                  Enviar novo áudio
                </Button>
              </>
            )}

            {phase !== 'processing' && phase !== 'done' && (
              <>
                {showAlreadyProcessed && pastAnalyses.length > 0 && (
                  <PastAnalysesSummary analyses={pastAnalyses} summary={meeting.analysisSummary} />
                )}
                <AudioCapture onAnalyze={(audio) => void run(audio)} analyzing={false} />
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leads envolvidos</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {involvedLeads.map((lead) => (
                <Link
                  key={lead.id}
                  to={`/crm/${lead.id}`}
                  className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2 hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800/60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-800 dark:text-white">{lead.fullName}</p>
                    <p className="truncate text-xs text-ink-400">{lead.jobTitle ?? '—'}</p>
                  </div>
                  <TemperatureBadge temperature={lead.temperature} />
                </Link>
              ))}
              {involvedLeads.length === 0 && <p className="text-sm text-ink-400">Nenhum lead vinculado.</p>}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Participantes</CardTitle>
            </CardHeader>
            <CardBody>
              {meeting.participants.length === 0 ? (
                <p className="text-sm text-ink-400">Nenhum participante registrado.</p>
              ) : (
                <ul className="space-y-1.5">
                  {meeting.participants.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-300">
                      <Users className="h-3.5 w-3.5 text-ink-300 dark:text-ink-600" />
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

function PastAnalysesSummary({
  analyses,
  summary,
}: {
  analyses: ReturnType<typeof useMeetingAnalyses>
  summary: string | null
}) {
  return (
    <div className="mb-4 rounded-lg border border-ink-100 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Última análise</p>
      {summary && <p className="mt-1.5 text-sm text-ink-700 dark:text-ink-300">{summary}</p>}
      <ul className="mt-3 space-y-1.5">
        {analyses.map((a) => (
          <li key={a.id} className="flex items-center justify-between text-xs text-ink-500 dark:text-ink-400">
            <span>Score {a.scoreBefore} → {a.scoreAfter}</span>
            <span className="text-ink-400">confiança {Math.round(a.confidence * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
