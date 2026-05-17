/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Name } from './name'
import { type OptionName } from './option'

type Get = <T>(name: Name<T>) => Promise<T>
export type Factory<T = any> = (get: Get) => Promise<T> | T
export type Configurator = (get: Get) => Promise<unknown>

export interface Definition {
  options: Map<OptionName, Factory[]>
  providers: Map<Name, Factory>
  configurators: Set<Configurator>
}
