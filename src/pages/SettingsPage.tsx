import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/integrations/supabase/client'
import { isMockMode } from '@/services/n8n'

export function SettingsPage() {
  const { user, isMockAuth } = useAuth()

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Status das integrações do protótipo." />

      <div className="max-w-2xl space-y-6 p-8">
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <InfoRow label="Nome" value={user?.name ?? '—'} />
            <InfoRow label="E-mail" value={user?.email ?? '—'} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrações</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <IntegrationStatus
              name="Supabase (Auth + Banco de dados)"
              configured={isSupabaseConfigured}
              configuredLabel="Conectado"
              missingLabel="Usando dados mockados e autenticação simulada"
              envVars={['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']}
            />
            <IntegrationStatus
              name="n8n — Webhook de análise de reunião"
              configured={!isMockMode}
              configuredLabel="Conectado"
              missingLabel="MOCK MODE ativo — respostas de IA são simuladas localmente"
              envVars={['VITE_N8N_ANALYZE_MEETING_WEBHOOK']}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como conectar o n8n</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-sm text-ink-600">
            <p>
              1. Crie um workflow no n8n com um nó <strong>Webhook</strong> (método POST).
            </p>
            <p>2. O corpo recebido segue o formato descrito em <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">src/services/n8n.ts</code> (contrato N8nAnalysisRequest).</p>
            <p>
              3. Configure <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">VITE_N8N_ANALYZE_MEETING_WEBHOOK</code> no arquivo{' '}
              <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">.env.local</code> com a URL do webhook.
            </p>
            <p>4. O workflow deve responder em JSON seguindo o contrato N8nAnalysisResponse.</p>
            <p className="flex items-center gap-1.5 pt-1 text-xs text-ink-400">
              <ExternalLink className="h-3.5 w-3.5" />
              Para produção, prefira rotear pela Supabase Edge Function em supabase/functions/analyze-meeting.
            </p>
          </CardBody>
        </Card>

        {isMockAuth && (
          <p className="rounded-lg bg-warm-50 px-4 py-3 text-xs text-warm-600 ring-1 ring-inset ring-warm-100">
            Autenticação simulada ativa. Configure o Supabase para habilitar login real com Supabase Auth.
          </p>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-400">{label}</span>
      <span className="font-medium text-ink-800">{value}</span>
    </div>
  )
}

function IntegrationStatus({
  name,
  configured,
  configuredLabel,
  missingLabel,
  envVars,
}: {
  name: string
  configured: boolean
  configuredLabel: string
  missingLabel: string
  envVars: string[]
}) {
  return (
    <div className="rounded-lg border border-ink-100 p-4">
      <div className="flex items-center gap-2">
        {configured ? (
          <CheckCircle2 className="h-4 w-4 text-positive-600" />
        ) : (
          <XCircle className="h-4 w-4 text-warm-500" />
        )}
        <p className="text-sm font-medium text-ink-900">{name}</p>
      </div>
      <p className="mt-1 pl-6 text-xs text-ink-500">{configured ? configuredLabel : missingLabel}</p>
      <div className="mt-2 flex flex-wrap gap-1.5 pl-6">
        {envVars.map((v) => (
          <code key={v} className="rounded bg-ink-100 px-1.5 py-0.5 text-[11px] text-ink-500">
            {v}
          </code>
        ))}
      </div>
    </div>
  )
}
