/* eslint-disable @typescript-eslint/no-explicit-any */
type Constructor<T, Arguments extends unknown[] = any[]> = new (...arguments_: Arguments) => T
import { mixins, type VueCons } from 'vue-facing-decorator'

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never

export type ExtractInstance<T> = T extends Constructor<infer V> ? V : never

type ExtractConstructorParameters<T> = T extends Constructor<infer _A> ? ConstructorParameters<T> : never

type CombinedConstructorParameters<TMixins extends Constructor<unknown>[]> = ExtractConstructorParameters<TMixins[number]>

type MixedClass<Mixins extends Constructor<unknown>[]> = Constructor<UnionToIntersection<ExtractInstance<Mixins[number]>>> & {
  new (...args: CombinedConstructorParameters<Mixins>): UnionToIntersection<ExtractInstance<Mixins[number]>>
}

export function Mixins<T extends VueCons[]>(...mxins: T): MixedClass<T> {
  return mixins(...mxins) as MixedClass<T>
}
