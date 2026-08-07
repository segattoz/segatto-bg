import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { LeadTemperature, LeadStatus, MeetingAnalysisStatus } from '@/types'
import { TEMPERATURE_LABELS, LEAD_STATUS_LABELS, MEETING_STATUS_LABELS } from '@/types'

const TEMPERATURE_STYLES: Record<LeadTemperature, string> = {
  hot: 'bg-hot-50 text-hot-600 ring-1 ring-inset ring-hot-100',
  warm: 'bg-warm-50 text-warm-600 ring-1 ring-inset ring-warm-100',
  cold: 'bg-cold-50 text-cold-600 ring-1 ring-inset ring-cold-100',
}

const TEMPERATURE_DOT: Record<LeadTemperature, string> = {
  hot: 'bg-hot-500',
  warm: 'bg-warm-500',
  cold: 'bg-cold-500',
}

export function TemperatureBadge({ temperature, className }: { temperature: LeadTemperature; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        TEMPERATURE_STYLES[temperature],
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', TEMPERATURE_DOT[temperature])} />
      {TEMPERATURE_LABELS[temperature]}
    </span>
  )
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  novo: 'bg-ink-100 text-ink-600',
  contato_inicial: 'bg-brand-50 text-brand-600',
  reuniao_agendada: 'bg-brand-100 text-brand-600',
  proposta: 'bg-warm-50 text-warm-600',
  negociacao: 'bg-warm-100 text-warm-600',
  fechado: 'bg-positive-100 text-positive-600',
  perdido: 'bg-negative-100 text-negative-600',
}

export function StatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        STATUS_STYLES[status],
        className,
      )}
    >
      {LEAD_STATUS_LABELS[status]}
    </span>
  )
}

const MEETING_STATUS_STYLES: Record<MeetingAnalysisStatus, string> = {
  pendente: 'bg-ink-100 text-ink-600',
  processando: 'bg-brand-100 text-brand-600',
  processada: 'bg-positive-100 text-positive-600',
  erro: 'bg-negative-100 text-negative-600',
}

export function MeetingStatusBadge({ status, className }: { status: MeetingAnalysisStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        MEETING_STATUS_STYLES[status],
        className,
      )}
    >
      {status === 'processando' && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
      )}
      {MEETING_STATUS_LABELS[status]}
    </span>
  )
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-600', className)}>
      {children}
    </span>
  )
}
