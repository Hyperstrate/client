import { type Configuration } from '@/__generated__/hyperstrate-api'
import { name, optionName } from '@/util/container'
import { type SupabaseClient } from '@supabase/supabase-js'
import { type VueHeadClient } from '@unhead/vue/client'
import { type VNode, type App as VueApp } from 'vue'
import { type Router } from 'vue-router'
import { type Agent, type ApiClient, type App, type Model } from '../model'
import { type Route } from '../router/model'
import { type RootStore } from '../store'

export const CONTAINER = 'CONTAINER'

export const ROUTES = optionName<Route[]>('ROUTES')
export const API_CLIENTS = optionName<ApiClient>('API_CLIENTS')
export const APPS = optionName<App>('APPS')
export const MODELS = optionName<Model>('MODELS')
export const AGENTS = optionName<Agent>('AGENTS')

export const APP = name<VueApp<Element>>('APP')
export const ROOT_COMPONENT = name<VNode>('ROOT_COMPONENT')
export const ROUTER = name<Router>('ROUTER')
export const STORE = name<RootStore>('STORE')
export const META = name<VueHeadClient>('META')
export const SUPABASE = name<SupabaseClient>('SUPABASE')

export const APP_MAP = name<Record<string, App>>('APP_MAP')
export const API_CLIENT_MAP = name<Record<string, ApiClient>>('API_CLIENT_MAP')

export const HYPERSTRATE_API_CONFIGURATION = name<Configuration>('HYPERSTRATE_API_CONFIGURATION')
