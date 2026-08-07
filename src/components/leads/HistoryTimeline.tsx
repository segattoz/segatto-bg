import { CalendarClock, TrendingUp, Thermometer, ArrowRightLeft, StickyNote, Sparkles } from 'lucide-react'
import { formatDateTime } from '@/lib/format'
import type { LeadHistoryEntry, LeadHistoryType } from '@/types'

const ICONS: Record<LeadHistoryType, typeof CalendarClock> = {
  meeting: CalendarClock,
  score_change: TrendingUp,
  temperature_change: Thermometer,
  status_change: ArrowRightLeft,
  note: StickyNote,
  ai_analysis: Sparkles,
}

const ICON_STYLES: Record<LeadHistoryType, string> = {
  meeting: 'bg-brand-50 text-brand-600',
  score_change: 'bg-positive-100 text-positive-600',
  temperature_change: 'bg-warm-50 text-warm-600',
  status_change: 'bg-ink-100 text-ink-600',
  note: 'bg-ink-100 text-ink-600',
  ai_analysis: 'bg-brand-100 text-brand-600',
}

export function HistoryTimeline({ entries }: { entries: LeadHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-400">Sem histórico registrado ainda.</p>
  }

  return (
    <ol className="space-y-0">
      {entries.map((entry, index) => {
        const Icon = ICONS[entry.type]
        return (
          <li key={entry.id} className="relative flex gap-3 pb-6 last:pb-0">
            {index < entries.length - 1 && (
              <span className="absolute left-[15px] top-8 h-[calc(100%-1.75rem)] w-px bg-ink-100" />
            )}
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ICON_STYLES[entry.type]}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="flex-1 pt-1">
              <p className="text-sm text-ink-800">{entry.description}</p>
              <p className="mt-0.5 text-xs text-ink-400">{formatDateTime(entry.createdAt)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
