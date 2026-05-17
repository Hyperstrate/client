export function toCSSClass(...lists: JsonScalar[]): string[] {
  return lists.flatMap((value) => {
    if (typeof value === 'string') return [value]
    if (Array.isArray(value)) return value.filter(Boolean) as string[]
    if (value && typeof value === 'object') {
      return Object.entries(value)
        .filter(([, value]) => Boolean(value))
        .map(([key]) => key)
    }
    return []
  })
}
