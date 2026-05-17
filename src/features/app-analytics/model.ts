import { type Option } from '@/features/ui/inputs/model'

export type Granularity = 'hour' | 'day' | 'month'

export const GRANULARITY_OPTIONS: Option<Granularity>[] = [
  { value: 'hour', label: 'Hourly' },
  { value: 'day', label: 'Daily' },
  { value: 'month', label: 'Monthly' },
]
