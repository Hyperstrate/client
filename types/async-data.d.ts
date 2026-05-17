/* eslint-disable @typescript-eslint/no-unsafe-function-type */

type AsyncData<T = unknown> = {
  [K in keyof T as T[K] extends Function ? never : K extends `$${string}` ? never : K]?: T[K]
}
