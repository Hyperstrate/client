import { Variant } from '@/features/ui/clickables/model'

export interface PipelineFlameLane {
  key: string
  label: string
}

export const SEG_BG: Record<string, string> = {
  passed: 'bg-emerald-400',
  success: 'bg-emerald-400',
  selected: 'bg-emerald-400',
  streaming: 'bg-indigo-500',
  coalesced: 'bg-sky-400',
  fallback: 'bg-amber-400',
  winner_found: 'bg-emerald-400',
  hit_exact: 'bg-blue-400',
  hit_semantic: 'bg-blue-300',
  miss: 'bg-gray-300',
  applied: 'bg-purple-400',
  enabled: 'bg-purple-300',
  schema_injected: 'bg-purple-300',
  examples_injected: 'bg-purple-300',
  target_selected: 'bg-indigo-400',
  routed: 'bg-indigo-400',
  overflow_routed: 'bg-amber-400',
  masked: 'bg-amber-400',
  flagged: 'bg-amber-400',
  filtered: 'bg-amber-400',
  recorded: 'bg-gray-300',
  stored: 'bg-gray-300',
  skipped: 'bg-gray-200',
  retry: 'bg-amber-500',
  max_turns: 'bg-amber-500',
  valid: 'bg-emerald-400',
  invalid_json: 'bg-red-400',
  normal: 'bg-emerald-300',
  anomaly: 'bg-red-400',
  dispatched: 'bg-sky-300',
  blocked: 'bg-red-400',
  error: 'bg-red-500',
}

export const OUTCOME_VARIANT: Record<string, Variant> = {
  passed: Variant.Green,
  success: Variant.Green,
  selected: Variant.Green,
  streaming: Variant.Indigo,
  coalesced: Variant.Indigo,
  fallback: Variant.Orange,
  winner_found: Variant.Green,
  hit_exact: Variant.Indigo,
  hit_semantic: Variant.Indigo,
  miss: Variant.Gray,
  applied: Variant.Purple,
  enabled: Variant.Purple,
  schema_injected: Variant.Purple,
  examples_injected: Variant.Purple,
  target_selected: Variant.Indigo,
  routed: Variant.Indigo,
  overflow_routed: Variant.Orange,
  masked: Variant.Orange,
  flagged: Variant.Orange,
  filtered: Variant.Orange,
  recorded: Variant.Gray,
  stored: Variant.Gray,
  skipped: Variant.Gray,
  retry: Variant.Orange,
  max_turns: Variant.Orange,
  valid: Variant.Green,
  invalid_json: Variant.Red,
  normal: Variant.Green,
  anomaly: Variant.Red,
  dispatched: Variant.Indigo,
  blocked: Variant.Red,
  error: Variant.Red,
}

export const LANE_DEFS: PipelineFlameLane[] = [
  { key: 'checks', label: 'Checks' },
  { key: 'cache', label: 'Cache' },
  { key: 'shape', label: 'Shape' },
  { key: 'route', label: 'Route' },
  { key: 'model', label: 'Model' },
  { key: 'post', label: 'Post' },
]

export const FLAME_ANIMATION_MS = 900
export const MIN_SEGMENT_ANIMATION_MS = 90
export const LANE_HEIGHT_PX = 28
export const LANE_GAP_PX = 0
export const SEGMENT_HEIGHT_PX = 14
export const LANE_LABEL_WIDTH_PX = 88
export const MIN_FLAME_HEIGHT_PX = 58
export const MIN_SEGMENT_PCT = 1.1
export const CRITICAL_MIN_SEGMENT_PCT = 8
export const MIN_SEQUENCE_GAP_PCT = 0.12
export const CRITICAL_OUTCOMES = new Set(['blocked', 'error', 'invalid_json', 'anomaly', 'max_turns'])
