import { type DateTime } from 'luxon'

export interface Input {
  readonly normalizedValue: unknown
  readonly empty?: boolean
  readonly pristine?: boolean
  readonly error?: boolean
}

export interface DatePreset {
  label: string
  date: (now: () => DateTime) => DateTime | undefined
}

export interface Option<T = unknown> {
  value: T
  label: string
}

export enum InputTextType {
  TEXT = 'text',
  PASSWORD = 'password',
  NUMBER = 'number',
}

export type OptionLabel<T = unknown> = (option?: Option<T>) => string
export type OptionValue<T = unknown, U = T> = (option?: Option<T>) => U
export type FilterFunction<T = unknown> = (values: Option<T>[], searchTerm: string) => Option<T>[]
