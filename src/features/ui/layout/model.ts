import { type Component } from 'vue'

export const REGISTER_LAYOUT = 'REGISTER_LAYOUT'
export const UNREGISTER_LAYOUT = 'UNREGISTER_LAYOUT'
export const EMPTY_CONFIG = { _isVue: true } as const
export type ComponentReference = string | Component
