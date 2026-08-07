import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(value: string | null | undefined, pattern = 'dd/MM/yyyy'): string {
  if (!value) return '—'
  try {
    const date = value.includes('T') ? parseISO(value) : parseISO(`${value}T00:00:00`)
    return format(date, pattern, { locale: ptBR })
  } catch {
    return value
  }
}

export function formatDateTime(value: string | null | undefined): string {
  return formatDate(value, "dd/MM/yyyy 'às' HH:mm")
}

export function formatRelative(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    const date = parseISO(value)
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
  } catch {
    return value
  }
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
