/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
export { Class } from 'type-fest'

type NonNullableType<T> = {
  [K in keyof T]: NonNullable<T[K]>
}

type Awaited<T> = T extends PromiseLike<infer U> ? U : T

declare interface PromiseConstructor {
  all<T extends unknown[]>(values: readonly [...T]): Promise<{ [P in keyof T]: Awaited<T[P]> }>
}

export type Constructor = new (...args: any[]) => any

export type NonNullable<T> = T extends null | undefined ? never : T

export type Arguments<F extends Function> = F extends (...args: infer A) => any ? A : never
export type Argument<F extends Function> = F extends (...args: infer A) => any ? A[0] : never

export type KeysOf<T, K extends keyof T = keyof T> = K
