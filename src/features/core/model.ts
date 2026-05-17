import { type HyperstrateServerInternalModulesAiDomainProvider } from '@/__generated__/hyperstrate-api'
import { type Component } from 'vue'
import { type Size } from '../ui/clickables/model'
import { type Route } from './router/model'

export class LoginRequired extends Error {}

export type AppName = `APP_${string}`

export interface App {
  name: AppName
  label: string
  link?: {
    to: Partial<Route>
    [key: string]: unknown
  }
  icon?: string
  order?: number
  group?: string
}

export interface Model {
  name: HyperstrateServerInternalModulesAiDomainProvider
  label: string
  shortLabel: string
  icons?: Partial<Record<Size, Component>>
  component: Component
  props?: Record<string, unknown>
}

export interface Agent {
  name: string
  label: string
  shortLabel: string
  aliases?: string[]
  category?: 'agent' | 'ide' | 'editor'
  icons?: Partial<Record<Size, Component>>
}
export interface ApiClient<T = unknown> {
  name: string
  client: T
}

export function appOrderCompare(a: App, b: App): number {
  return (a.order || 0) - (b.order || 0) || (a.label || a.name).localeCompare(b.label || b.name)
}
