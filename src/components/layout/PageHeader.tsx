import type { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-ink-100 bg-white px-4 py-4 dark:border-ink-800 dark:bg-ink-900 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight text-ink-900 dark:text-white sm:text-xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
