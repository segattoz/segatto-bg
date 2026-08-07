import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'

export function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: ReactNode
  icon: ReactNode
  accent?: 'hot' | 'warm' | 'cold' | 'brand' | 'neutral'
}) {
  const accentStyles: Record<NonNullable<typeof accent>, string> = {
    hot: 'bg-hot-50 text-hot-600 dark:bg-hot-500/15 dark:text-hot-400',
    warm: 'bg-warm-50 text-warm-600 dark:bg-warm-500/15 dark:text-warm-400',
    cold: 'bg-cold-50 text-cold-600 dark:bg-cold-500/15 dark:text-cold-400',
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400',
    neutral: 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300',
  }

  return (
    <Card className="animate-fade-in-up p-4 transition-transform hover:-translate-y-0.5 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-ink-400 sm:text-sm">{label}</p>
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', accentStyles[accent ?? 'neutral'])}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-ink-900 dark:text-white sm:text-2xl">{value}</p>
    </Card>
  )
}
