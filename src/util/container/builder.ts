import { type Name, type ResolveType } from './name'
import { type Definition, type Configurator, type Factory } from './definition'
import { type ResolveOptionType, type OptionName } from './option'

type Context = Record<string, () => Promise<{ default: Builder }>>
interface Tools {
  option<O extends OptionName, T extends ResolveOptionType<O>>(optionName: O, factory: Factory<T>): void
  provide<N extends Name, T extends ResolveType<N>>(name: N, factory: Factory<T>): void
  configure(configurator: Configurator): void
}

export type Builder = (tools: Tools) => void

export function builder(builder: Builder): Builder {
  return builder
}

export function option<O extends OptionName, T extends ResolveOptionType<O>>(optionName: O, factory: Factory<T>): Builder {
  return builder(({ option }) => void option(optionName, factory))
}

export function provide<N extends Name, T extends ResolveType<N>>(name: N, factory: Factory<T>): Builder {
  return builder(({ provide }) => void provide(name, factory))
}

export function configure(configurator: Configurator): Builder {
  return builder(({ configure }) => void configure(configurator))
}

export function build(builders: Iterable<Builder>): Definition {
  const definition = createDefinition()

  const tools = createTools(definition)

  for (const builder of builders) {
    builder(tools)
  }

  return definition
}

function createDefinition(): Definition {
  return {
    options: new Map() as Definition['options'],
    providers: new Map() as Definition['providers'],
    configurators: new Set(),
  }
}

function createTools({ options, providers, configurators }: Definition): Tools {
  return {
    option(name, factory) {
      if (providers.has(name)) {
        throw new Error(`Can not define an option with name "${String(name)}" since it is already used as the name of a provider.`)
      }

      const factories = options.get(name) || new Array<Factory>()
      factories.push(factory)
      options.set(name, factories)
    },
    provide(name, factory) {
      if (options.has(name)) {
        throw new Error(`Can not define a provider with name "${String(name)}" since it is already used as the name of an option.`)
      }

      providers.set(name, factory)
    },
    configure: configurators.add.bind(configurators),
  }
}

export function* load(context: Context): Iterable<Promise<Builder>> {
  for (const path of Object.keys(context)) {
    yield context[path]().then(getDefaultExport)
  }
}

function getDefaultExport(mod: { default: Builder }): Builder {
  return mod.default
}
