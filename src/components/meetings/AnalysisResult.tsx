import { ArrowUp, ArrowDown, Minus, CheckCircle2, CalendarClock } from 'lucide-react'
import { TemperatureBadge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { formatDate } from '@/lib/format'
import type { MeetingAnalysisResult } from '@/types'

function ordinal(n: number) {
  return `${n}º`
}

export function AnalysisResult({ result }: { result: MeetingAnalysisResult }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-positive-100 bg-positive-100/30 p-5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-positive-600" />
        <div>
          <p className="text-sm font-semibold text-positive-600">Análise concluída</p>
          <p className="mt-1 text-sm text-ink-700">{result.summary}</p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink-900">Ranking atualizado</h3>
        <div className="space-y-3">
          {result.changes.map((change) => {
            const delta =
              change.rankingBefore != null ? change.rankingBefore - change.rankingAfter : null

            return (
              <Card key={change.leadId}>
                <CardBody className="p-4">
                  <div className="flex items-start gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-sm font-bold text-white">
                      {ordinal(change.priority)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-ink-900">{change.companyName}</p>
                        <TemperatureBadge temperature={change.temperatureAfter} />
                        <span className="text-sm font-semibold tabular-nums text-ink-900">Score: {change.scoreAfter}</span>
                        {delta !== null && delta !== 0 && (
                          <span
                            className={`flex items-center gap-0.5 text-xs font-semibold ${
                              delta > 0 ? 'text-positive-600' : 'text-negative-600'
                            }`}
                          >
                            {delta > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {delta > 0 ? 'Subiu' : 'Caiu'} {Math.abs(delta)} posiç{Math.abs(delta) === 1 ? 'ão' : 'ões'}
                          </span>
                        )}
                        {(delta === 0 || delta === null) && (
                          <span className="flex items-center gap-0.5 text-xs font-medium text-ink-400">
                            <Minus className="h-3 w-3" /> sem alteração de posição
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-ink-600">
                        <span className="font-medium text-ink-700">Motivo: </span>
                        {change.reason}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-400">
                        <span>
                          Antes: <strong className="text-ink-600">{change.rankingBefore ? ordinal(change.rankingBefore) : '—'}</strong>
                        </span>
                        <span>
                          Agora: <strong className="text-ink-600">{ordinal(change.rankingAfter)}</strong>
                        </span>
                        <span>Confiança: {Math.round(change.confidence * 100)}%</span>
                      </div>

                      {change.nextAction && (
                        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-600">
                          <CalendarClock className="h-3.5 w-3.5" />
                          Próxima ação: {change.nextAction}
                          {change.nextActionDeadline && ` até ${formatDate(change.nextActionDeadline)}`}
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
