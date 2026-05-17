export type FormDataRecord = Record<string, unknown>
export type FormAction<T extends FormDataRecord = FormDataRecord, R = unknown, P = unknown> = (data: T, param?: P) => Promise<R>

export type Transformer<T = unknown, R = unknown> = (value: T) => R
export interface FormSubmittedEvent<T = unknown, U = T> {
  data: T
  result: U
}
