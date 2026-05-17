const shortDateTimeOptions: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}

const numberFormatter = new Intl.NumberFormat()

export function formatDate(value: string | Date | undefined | null, options: Intl.DateTimeFormatOptions = shortDateTimeOptions): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, options)
}

export function formatNumber(value: number | string | undefined | null): string {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return '0'
  return numberFormatter.format(n)
}

export function formatCompactNumber(value: number | string | undefined | null): string {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return '0'
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(Math.round(n))
}

export function formatCurrency(value: number | string | undefined | null, digits = 4): string {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return `$${(0).toFixed(digits)}`
  return `$${n.toFixed(digits)}`
}

export function formatAdaptiveCurrency(value: number | string | undefined | null): string {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return '$0.0000'
  return n >= 1 ? `$${n.toFixed(2)}` : `$${n.toFixed(4)}`
}

export function formatPercent(value: number | string | undefined | null, digits = 1): string {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return `${(0).toFixed(digits)}%`
  return `${n.toFixed(digits)}%`
}

export function formatDurationMs(value: number | string | undefined | null): string {
  const ms = Number(value ?? 0)
  if (!Number.isFinite(ms)) return '0ms'
  if (ms < 1000) return `${ms < 10 ? ms.toFixed(2) : Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}
