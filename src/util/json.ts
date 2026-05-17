export function parseJsonObject(value: unknown): Record<string, unknown> | undefined {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) return undefined

  const parsed = JSON.parse(text)
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : undefined
}
