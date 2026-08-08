import type { ReactNode } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Briefcase, Mail, Phone, Tag, User, Users, CalendarClock, ArrowUp, ArrowDown, Minus, ShieldCheck } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { TemperatureBadge, StatusBadge } from '@/components/ui/Badge'
import { HistoryTimeline } from '@/components/leads/HistoryTimeline'
import { formatDate } from '@/lib/format'
import { useLead } from '@/hooks/useLeads'
import { useLeadHistory } from '@/hooks/useLeadHistory'
import { useMeetings } from '@/hooks/useMeetings'

export function LeadDetailPage() {
  const { leadId } = useParams<{ leadId: string }>()
  const lead = useLead(leadId)
  const history = useLeadHistory(leadId)
  const meetings = useMeetings()

  if (!lead) return <Navigate to="/crm" replace />

  const leadMeetings = meetings.filter((m) => m.leadIds.includes(lead.id))

  const rankingDelta =
    lead.previousRanking != null && lead.ranking != null ? lead.previousRanking - lead.ranking : 0

  return (
    <div className="p-4 sm:p-8">
      <Link
        to="/crm"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar para o CRM
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-ink-900 dark:text-white sm:text-2xl">{lead.fullName}</h1>
            <TemperatureBadge temperature={lead.temperature} />
            <StatusBadge status={lead.status} />
          </div>
          <p className="mt-1 text-sm text-ink-400">
            {lead.jobTitle ?? 'Profissão não informada'}
            {lead.referredBy ? ` · Indicado por ${lead.referredBy}` : ''}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-3xl font-semibold tabular-nums text-ink-900 dark:text-white">{lead.score}</p>
          <p className="text-xs text-ink-400">score atual</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Dados</CardTitle>
            </CardHeader>
            <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field icon={Briefcase} label="Profissão / Cargo" value={lead.jobTitle ?? '—'} />
              <Field icon={Phone} label="Telefone" value={lead.phone ?? '—'} />
              <Field icon={Mail} label="E-mail" value={lead.email ?? '—'} />
              <Field icon={Tag} label="Origem" value={lead.source ?? '—'} />
              <Field icon={Users} label="Indicado por" value={lead.referredBy ?? '—'} />
              <Field icon={User} label="Responsável" value={lead.responsibleName ?? '—'} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insights</CardTitle>
            </CardHeader>
            <CardBody>
              {lead.insights.length === 0 ? (
                <p className="text-sm text-ink-400">Nenhum insight registrado ainda. Analise uma reunião para gerar insights.</p>
              ) : (
                <ul className="space-y-2">
                  {lead.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-700 dark:text-ink-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                      {insight}
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recomendações</CardTitle>
            </CardHeader>
            <CardBody>
              {lead.recommendedProducts.length === 0 ? (
                <p className="text-sm text-ink-400">
                  Nenhuma recomendação ainda. Após a próxima reunião analisada, os produtos de seguro mais adequados
                  aparecem aqui.
                </p>
              ) : (
                <ul className="space-y-2">
                  {lead.recommendedProducts.map((product, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                    >
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                      {product}
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardBody>
              <HistoryTimeline entries={history} />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Classificação</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <Row label="Score atual" value={<span className="font-semibold text-ink-900 dark:text-white">{lead.score} / 100</span>} />
              <Row label="Temperatura" value={<TemperatureBadge temperature={lead.temperature} />} />
              <Row
                label="Ranking atual"
                value={
                  <span className="flex items-center gap-1.5 font-semibold text-ink-900 dark:text-white">
                    #{lead.ranking ?? '—'}
                    {rankingDelta !== 0 && (
                      <span
                        className={`flex items-center text-xs font-medium ${rankingDelta > 0 ? 'text-positive-600 dark:text-positive-400' : 'text-negative-600 dark:text-negative-400'}`}
                      >
                        {rankingDelta > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {Math.abs(rankingDelta)}
                      </span>
                    )}
                    {rankingDelta === 0 && <Minus className="h-3 w-3 text-ink-300" />}
                  </span>
                }
              />
              <Row label="Status comercial" value={<StatusBadge status={lead.status} />} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próxima ação</CardTitle>
            </CardHeader>
            <CardBody>
              {lead.nextAction ? (
                <>
                  <p className="text-sm font-medium text-ink-900 dark:text-white">{lead.nextAction}</p>
                  {lead.nextActionDeadline && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-400">
                      <CalendarClock className="h-3.5 w-3.5" />
                      até {formatDate(lead.nextActionDeadline)}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-ink-400">Nenhuma ação definida.</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reuniões</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {leadMeetings.length === 0 && <p className="text-sm text-ink-400">Nenhuma reunião registrada.</p>}
              {leadMeetings.map((meeting) => (
                <Link
                  key={meeting.id}
                  to={`/reunioes/${meeting.id}`}
                  className="block rounded-lg border border-ink-100 px-3 py-2 text-sm hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800/60"
                >
                  <p className="font-medium text-ink-800 dark:text-white">{meeting.title}</p>
                  <p className="text-xs text-ink-400">{formatDate(meeting.meetingDate)}</p>
                </Link>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Field({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-300 dark:text-ink-600" />
      <div className="min-w-0">
        <p className="text-xs text-ink-400">{label}</p>
        <p className="truncate text-sm font-medium text-ink-800 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-ink-500 dark:text-ink-400">{label}</span>
      {value}
    </div>
  )
}
