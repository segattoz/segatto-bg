import { CheckCircle2, XCircle, ExternalLink, Moon, Sun } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { isSupabaseConfigured } from '@/integrations/supabase/client'
import { isMockMode } from '@/services/n8n'
import { cn } from '@/lib/cn'

export function SettingsPage() {
  const { user, isMockAuth } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Status das integrações do protótipo." />

      <div className="max-w-2xl space-y-6 p-4 sm:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-800 dark:text-white">Tema</p>
                <p className="text-xs text-ink-400">Claro ou escuro, salvo neste dispositivo.</p>
              </div>
              <div className="flex items-center rounded-lg border border-ink-200 p-0.5 dark:border-ink-700">
                <button
                  onClick={() => theme !== 'light' && toggleTheme()}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    theme === 'light' ? 'bg-ink-900 text-white' : 'text-ink-500 hover:bg-ink-50 dark:text-ink-400 dark:hover:bg-ink-800',
                  )}
                >
                  <Sun className="h-3.5 w-3.5" /> Claro
                </button>
                <button
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    theme === 'dark' ? 'bg-brand-500 text-white' : 'text-ink-500 hover:bg-ink-50 dark:text-ink-400 dark:hover:bg-ink-800',
                  )}
                >
                  <Moon className="h-3.5 w-3.5" /> Escuro
                </button>
              </div>
            </div>
          </CardBody>
        </Card>

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
          <CardBody className="space-y-3 text-sm text-ink-600 dark:text-ink-300">
            <p>
              1. Crie um workflow no n8n com um nó <strong>Webhook</strong> (método POST).
            </p>
            <p>
              2. O corpo recebido segue o formato descrito em{' '}
              <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs dark:bg-ink-800">src/services/n8n.ts</code> (contrato
              N8nAnalysisRequest).
            </p>
            <p>
              3. Configure <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs dark:bg-ink-800">VITE_N8N_ANALYZE_MEETING_WEBHOOK</code>{' '}
              no arquivo <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs dark:bg-ink-800">.env.local</code> com a URL do webhook.
            </p>
            <p>4. O workflow deve responder em JSON seguindo o contrato N8nAnalysisResponse.</p>
            <p className="flex items-start gap-1.5 pt-1 text-xs text-ink-400">
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Para produção, prefira rotear pela Supabase Edge Function em supabase/functions/analyze-meeting.
            </p>
          </CardBody>
        </Card>

        {isMockAuth && (
          <p className="rounded-lg bg-warm-50 px-4 py-3 text-xs text-warm-600 ring-1 ring-inset ring-warm-100 dark:bg-warm-500/10 dark:text-warm-400 dark:ring-warm-500/20">
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
      <span className="font-medium text-ink-800 dark:text-white">{value}</span>
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
    <div className="rounded-lg border border-ink-100 p-4 dark:border-ink-800">
      <div className="flex items-center gap-2">
        {configured ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-positive-600 dark:text-positive-400" />
        ) : (
          <XCircle className="h-4 w-4 shrink-0 text-warm-500 dark:text-warm-400" />
        )}
        <p className="text-sm font-medium text-ink-900 dark:text-white">{name}</p>
      </div>
      <p className="mt-1 pl-6 text-xs text-ink-500 dark:text-ink-400">{configured ? configuredLabel : missingLabel}</p>
      <div className="mt-2 flex flex-wrap gap-1.5 pl-6">
        {envVars.map((v) => (
          <code key={v} className="rounded bg-ink-100 px-1.5 py-0.5 text-[11px] text-ink-500 dark:bg-ink-800 dark:text-ink-400">
            {v}
          </code>
        ))}
      </div>
    </div>
  )
}
