import type { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-300', className)} {...props} />
}

// text-base on the field prevents iOS Safari from auto-zooming on focus; text-sm kicks in from sm: up.
const fieldBase =
  'w-full rounded-lg border border-ink-200 bg-white text-base text-ink-900 placeholder:text-ink-400 outline-none transition-shadow focus:border-brand-400 focus:ring-4 focus:ring-brand-100 sm:text-sm dark:border-ink-700 dark:bg-ink-800 dark:text-white dark:placeholder:text-ink-500 dark:focus:border-brand-400 dark:focus:ring-brand-500/20'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, 'h-11 px-3 sm:h-10', className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, 'px-3 py-2.5 sm:py-2', className)} {...props} />
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldBase, 'h-11 px-3 sm:h-10', className)} {...props} />
}
