import type {
  HyperstrateServerInternalModulesAiApplicationModelResponse,
  HyperstrateServerInternalModulesRouterApplicationRouterResponse,
} from '@/__generated__/hyperstrate-api'
import type { Option } from '@/features/ui/inputs/model'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  fields?: Record<string, string>
  streaming?: boolean
}

export interface Conversation {
  id: string
  modelId: string
  title: string
  preview?: string
  createdAt: string
  modifiedAt: string
}

export interface InputFieldDef {
  key: string
  label: string
  type: string
  required: boolean
  description?: string
}

export interface SendPayload {
  prompt: string
  apiFields: Record<string, string>
  displayFields: Record<string, string>
}

export type ModelOption = Option<HyperstrateServerInternalModulesAiApplicationModelResponse>
export type RouterOption = Option<HyperstrateServerInternalModulesRouterApplicationRouterResponse>
export type ChatMode = 'model' | 'router'
