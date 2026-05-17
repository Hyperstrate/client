import { isEmpty } from 'lodash'

export const VITE_ENVIRONMENT = envVariable('VITE_ENVIRONMENT')
export const APP_TITLE = envVariable('VITE_APP_TITLE')
export const HYPERSTRATE_API_URL = envVariable('VITE_HYPERSTRATE_API_URL')
export const SUPABASE_URL = envVariable('VITE_SUPABASE_URL')
export const SUPABASE_PUBLISHABLE_KEY = envVariable('VITE_SUPABASE_PUBLISHABLE_KEY')

export function envVariable(name: string, def?: string): string {
  const envVariable = !isEmpty(import.meta.env[name]) ? import.meta.env[name] : def

  if (envVariable === undefined) {
    throw new Error(`env variable ${name} not provided`)
  }

  return envVariable
}

export function optionalEnvVariable(name: string): string | undefined {
  return import.meta.env[name]
}

export function isProdEnv(): boolean {
  return VITE_ENVIRONMENT === 'production'
}

export function isDevEnv(): boolean {
  return VITE_ENVIRONMENT === 'development'
}
