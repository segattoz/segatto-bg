import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { TemperatureBadge } from '@/components/ui/Badge'
import type { Lead } from '@/types'

export function TopLeadsCard({ leads }: { leads: Lead[] }) {
  const top5 = [...leads].sort((a, b) => b.score - a.score).slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top leads do momento</CardTitle>
        <Link to="/crm" className="text-xs font-medium text-brand-500 hover:text-brand-600">
          Ver todos
        </Link>
      </CardHeader>
      <CardBody className="p-2">
        <ul>
          {top5.map((lead, index) => (
            <li key={lead.id}>
              <Link
                to={`/crm/${lead.id}`}
                className="flex items-center gap-4 rounded-lg px-3 py-2.5 hover:bg-ink-50"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-ink-100 text-xs font-semibold text-ink-500">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{lead.companyName}</p>
                  <p className="truncate text-xs text-ink-400">{lead.contactName}</p>
                </div>
                <TemperatureBadge temperature={lead.temperature} />
                <span className="w-14 shrink-0 text-right text-sm font-semibold tabular-nums text-ink-900">
                  {lead.score} pts
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}
