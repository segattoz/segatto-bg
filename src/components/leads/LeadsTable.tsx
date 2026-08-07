import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'
import { TemperatureBadge, StatusBadge } from '@/components/ui/Badge'
import type { Lead, LeadTemperature } from '@/types'

type SortKey = 'ranking' | 'score' | 'temperature' | 'lastMeetingAt' | 'companyName' | 'createdAt'
type SortDirection = 'asc' | 'desc'

const TEMPERATURE_WEIGHT: Record<LeadTemperature, number> = { hot: 2, warm: 1, cold: 0 }

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [direction, setDirection] = useState<SortDirection>('desc')

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setDirection('desc')
    }
  }

  const sorted = useMemo(() => {
    const copy = [...leads]
    copy.sort((a, b) => {
      let result = 0
      switch (sortKey) {
        case 'ranking':
          result = (a.ranking ?? 999) - (b.ranking ?? 999)
          break
        case 'score':
          result = a.score - b.score
          break
        case 'temperature':
          result = TEMPERATURE_WEIGHT[a.temperature] - TEMPERATURE_WEIGHT[b.temperature]
          break
        case 'lastMeetingAt':
          result = (a.lastMeetingAt ?? '').localeCompare(b.lastMeetingAt ?? '')
          break
        case 'companyName':
          result = a.companyName.localeCompare(b.companyName)
          break
        case 'createdAt':
          result = a.createdAt.localeCompare(b.createdAt)
          break
      }
      return direction === 'asc' ? result : -result
    })
    return copy
  }, [leads, sortKey, direction])

  return (
    <div className="rounded-xl border border-ink-100 bg-white dark:border-ink-800 dark:bg-ink-900">
      <div className="flex flex-col gap-2 border-b border-ink-100 px-4 py-3 dark:border-ink-800 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-400">{leads.length} lead(s) · ordenado por score (padrão)</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-400">Ordenar por</span>
          <select
            value={sortKey}
            onChange={(e) => toggleSort(e.target.value as SortKey)}
            className="h-8 flex-1 rounded-md border border-ink-200 bg-white px-2 text-xs text-ink-700 outline-none focus:border-brand-400 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200 sm:flex-none"
          >
            <option value="score">Score</option>
            <option value="temperature">Temperatura</option>
            <option value="lastMeetingAt">Última interação</option>
            <option value="companyName">Nome</option>
            <option value="createdAt">Data de criação</option>
          </select>
          <button
            onClick={() => setDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-ink-200 text-ink-500 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-400 dark:hover:bg-ink-800"
            title="Inverter ordem"
          >
            {direction === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Mobile: stacked cards */}
      <ul className="divide-y divide-ink-50 dark:divide-ink-800 md:hidden">
        {sorted.map((lead) => (
          <li key={lead.id}>
            <Link
              to={`/crm/${lead.id}`}
              className="flex items-center gap-3 px-4 py-3.5 active:bg-ink-50 dark:active:bg-ink-800"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ink-100 text-xs font-semibold text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                {lead.ranking ?? '—'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium text-ink-900 dark:text-white">{lead.companyName}</p>
                  <span className="shrink-0 font-semibold tabular-nums text-ink-900 dark:text-white">{lead.score}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-ink-400">{lead.contactName}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <TemperatureBadge temperature={lead.temperature} />
                  <StatusBadge status={lead.status} />
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-300 dark:text-ink-600" />
            </Link>
          </li>
        ))}
        {sorted.length === 0 && <li className="p-8 text-center text-sm text-ink-400">Nenhum lead encontrado.</li>}
      </ul>

      {/* Desktop: full table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1100px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50/60 text-left text-xs font-medium uppercase tracking-wide text-ink-400 dark:border-ink-800 dark:bg-ink-800/40">
              <Th label="#" />
              <SortableTh label="Empresa" sortKey="companyName" active={sortKey} direction={direction} onClick={toggleSort} />
              <Th label="Contato" />
              <Th label="Telefone" />
              <Th label="E-mail" />
              <Th label="Status" />
              <SortableTh label="Temperatura" sortKey="temperature" active={sortKey} direction={direction} onClick={toggleSort} />
              <SortableTh label="Score" sortKey="score" active={sortKey} direction={direction} onClick={toggleSort} align="right" />
              <SortableTh label="Última reunião" sortKey="lastMeetingAt" active={sortKey} direction={direction} onClick={toggleSort} />
              <Th label="Próxima ação" />
              <Th label="Responsável" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((lead) => (
              <tr key={lead.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60 dark:border-ink-800 dark:hover:bg-ink-800/40">
                <td className="px-4 py-3 text-ink-400">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-ink-100 text-xs font-semibold text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                    {lead.ranking ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link to={`/crm/${lead.id}`} className="font-medium text-ink-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400">
                    {lead.companyName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{lead.contactName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-ink-500 dark:text-ink-400">{lead.phone ?? '—'}</td>
                <td className="px-4 py-3 text-ink-500 dark:text-ink-400">{lead.email ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3">
                  <TemperatureBadge temperature={lead.temperature} />
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink-900 dark:text-white">{lead.score}</td>
                <td className="px-4 py-3 whitespace-nowrap text-ink-500 dark:text-ink-400">{formatDate(lead.lastMeetingAt)}</td>
                <td className="max-w-[220px] truncate px-4 py-3 text-ink-600 dark:text-ink-300">{lead.nextAction ?? '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap text-ink-500 dark:text-ink-400">{lead.responsibleName ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <p className="p-8 text-center text-sm text-ink-400">Nenhum lead encontrado.</p>}
      </div>
    </div>
  )
}

function Th({ label }: { label: string }) {
  return <th className="px-4 py-3 font-medium">{label}</th>
}

function SortableTh({
  label,
  sortKey,
  active,
  direction,
  onClick,
  align = 'left',
}: {
  label: string
  sortKey: SortKey
  active: SortKey
  direction: SortDirection
  onClick: (key: SortKey) => void
  align?: 'left' | 'right'
}) {
  const isActive = active === sortKey
  const Icon = isActive ? (direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <th className={cn('px-4 py-3 font-medium', align === 'right' && 'text-right')}>
      <button
        onClick={() => onClick(sortKey)}
        className={cn(
          'inline-flex items-center gap-1 hover:text-ink-700 dark:hover:text-ink-200',
          align === 'right' && 'flex-row-reverse',
          isActive && 'text-ink-700 dark:text-ink-200',
        )}
      >
        {label}
        <Icon className="h-3 w-3" />
      </button>
    </th>
  )
}
