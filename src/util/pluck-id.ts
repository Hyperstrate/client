export function pluckIds<T>(objects: { id: T }[]): T[] {
  return objects.map(pluckId)
}

export function pluckId<T>(object: { id: T }): T {
  return object.id
}
