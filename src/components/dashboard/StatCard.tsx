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
    hot: 'bg-hot-50 text-hot-600',
    warm: 'bg-warm-50 text-warm-600',
    cold: 'bg-cold-50 text-cold-600',
    brand: 'bg-brand-50 text-brand-600',
    neutral: 'bg-ink-100 text-ink-600',
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-400">{label}</p>
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', accentStyles[accent ?? 'neutral'])}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-ink-900">{value}</p>
    </Card>
  )
}
