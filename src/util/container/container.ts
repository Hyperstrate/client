/* eslint-disable @typescript-eslint/no-explicit-any */
import { build, load, type Builder } from './builder'
import { type Definition, type Factory } from './definition'
import { type Name } from './name'

export type SafeGet<V = unknown> = <T extends V>(name: Name<T>) => T
type ResolvedMap = Map<Name, any>
type Resolver = (value: any) => void
type Context = Record<string, () => Promise<{ default: Builder }>>

export async function container(context: Context): Promise<SafeGet> {
  const builders = await Promise.all([...load(context)])

  const definition = build(builders)
  const resolved = await resolve(definition)

  return createSafeNameMapGetter(resolved)
}

async function resolve(definition: Definition): Promise<ResolvedMap> {
  const resolved: ResolvedMap = new Map<Name, any>()

  const deps = new Map<Name, Promise<any>>()
  const resolvers = new Map<Name, Resolver>()
  const get = createSafeNameMapGetter(deps)

  for (const map of [definition.options, definition.providers]) {
    for (const name of map.keys()) {
      deps.set(name, new Promise((resolve) => void resolvers.set(name, resolve)))
    }
  }

  const running = new Array<Promise<unknown>>()

  function execute(factory: Factory<any>): Promise<any> {
    return factory(get)
  }

  function resolver(name: Name): (value: any) => void {
    return (value) => {
      resolved.set(name, value)

      const resolve = resolvers.get(name)
      if (resolve) {
        resolve(value)
        resolvers.delete(name)
      }
    }
  }

  for (const [name, factories] of definition.options) {
    running.push(
      Promise.all(factories.map(execute))
        .then(resolver(name))
        .catch((error) => console.error('options error:', error)),
    )
  }

  for (const [name, factory] of definition.providers) {
    running.push(factory(get).then(resolver(name)))
  }

  for (const configurator of definition.configurators) {
    running.push(configurator(get).catch((error) => console.error('Configurator error:', error)))
  }

  await Promise.all(running)

  for (const [name] of deps) {
    if (!resolved.has(name)) {
      console.warn(`Dependency "${String(name)}" was never resolved!`)
    }
  }

  return resolved
}

function createSafeNameMapGetter<V>(map: Map<Name, V>): SafeGet<V> {
  return (key) => {
    const value = map.get(key)

    if (!value) {
      throw new Error(`${String(key)} not found`)
    }

    return value as any
  }
}
