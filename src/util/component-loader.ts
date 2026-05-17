import { kebabCase } from 'lodash-es'
import { type AsyncComponentLoader, defineAsyncComponent, type App, type Component, type DefineComponent } from 'vue'

type Context = Record<string, () => unknown>
type AsyncContext = Record<string, () => Promise<unknown>>

const prefixRegEx = /^.*\//
const suffixRegEx = /\..*$/

export function extractComponent(component: Component): Component {
  return 'default' in component ? component.default : component
}

export function toComponentName(path: string): string {
  return kebabCase(path.replace(prefixRegEx, '').replace(suffixRegEx, ''))
}

export interface ComponentLoaderResult {
  name: string
  component: Component
}

export function createLoader(context: Context, prefix = ''): () => Iterable<ComponentLoaderResult> {
  return function* () {
    for (const [path, mod] of Object.entries(context)) {
      const component = extractComponent(mod)
      const name = prefix + toComponentName(path)
      yield { name, component }
    }
  }
}

export default function registerComponents(vue: App, context: Context, prefix = ''): void {
  for (const { name, component } of createLoader(context, prefix)()) {
    vue.component(name, component)
  }
}

export function registerAsyncComponents(
  vue: App,
  context: AsyncContext,
  factory: (path: string) => Component | DefineComponent | Lazy<Component | DefineComponent>,
  prefix = '',
): void {
  for (const path of Object.keys(context)) {
    vue.component(prefix + toComponentName(path), defineAsyncComponent(factory(path.slice(2)) as AsyncComponentLoader))
  }
}
