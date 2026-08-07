import { cn } from '@/lib/cn'
import type { LeadTemperature } from '@/types'

const RING_COLOR: Record<LeadTemperature, string> = {
  hot: 'text-hot-500',
  warm: 'text-warm-500',
  cold: 'text-cold-500',
}

export function ScoreBadge({ score, temperature, className }: { score: number; temperature: LeadTemperature; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 font-semibold tabular-nums', RING_COLOR[temperature], className)}>
      {score}
      <span className="text-xs font-normal text-ink-400">/100</span>
    </span>
  )
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  return (
    <span
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600',
        className,
      )}
    >
      {initials}
    </span>
  )
}
