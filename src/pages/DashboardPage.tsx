import { Users, Flame, Thermometer, Snowflake, CalendarCheck, Clock } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { TopLeadsCard } from '@/components/dashboard/TopLeadsCard'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { useLeads } from '@/hooks/useLeads'
import { useMeetings } from '@/hooks/useMeetings'
import { useAuth } from '@/hooks/useAuth'

export function DashboardPage() {
  const leads = useLeads()
  const meetings = useMeetings()
  const { user } = useAuth()

  const hot = leads.filter((l) => l.temperature === 'hot').length
  const warm = leads.filter((l) => l.temperature === 'warm').length
  const cold = leads.filter((l) => l.temperature === 'cold').length
  const awaitingReturn = leads.filter((l) => l.status === 'proposta' || l.status === 'negociacao').length
  const meetingsHeld = meetings.filter((m) => m.status !== 'pendente').length

  const firstName = user?.name?.split(' ')[0] ?? ''

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`Bem-vindo de volta, ${firstName}. Aqui está o panorama da sua carteira de seguros de vida.`} />

      <div className="space-y-5 p-4 sm:space-y-6 sm:p-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total de leads" value={leads.length} icon={<Users className="h-4 w-4" />} accent="brand" />
          <StatCard label="Leads quentes" value={hot} icon={<Flame className="h-4 w-4" />} accent="hot" />
          <StatCard label="Leads mornos" value={warm} icon={<Thermometer className="h-4 w-4" />} accent="warm" />
          <StatCard label="Leads frios" value={cold} icon={<Snowflake className="h-4 w-4" />} accent="cold" />
          <StatCard
            label="Reuniões realizadas"
            value={meetingsHeld}
            icon={<CalendarCheck className="h-4 w-4" />}
            accent="neutral"
          />
          <StatCard
            label="Aguardando retorno"
            value={awaitingReturn}
            icon={<Clock className="h-4 w-4" />}
            accent="neutral"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TopLeadsCard leads={leads} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por temperatura</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <TemperatureBar label="Quente" count={hot} total={leads.length} colorClass="bg-hot-500" />
              <TemperatureBar label="Morno" count={warm} total={leads.length} colorClass="bg-warm-500" />
              <TemperatureBar label="Frio" count={cold} total={leads.length} colorClass="bg-cold-500" />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

function TemperatureBar({
  label,
  count,
  total,
  colorClass,
}: {
  label: string
  count: number
  total: number
  colorClass: string
}) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100)
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-ink-700 dark:text-ink-200">{label}</span>
        <span className="text-ink-400">
          {count} · {pct}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
        <div className={`h-full rounded-full transition-[width] duration-500 ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
