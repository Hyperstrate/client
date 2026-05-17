export { Action as RootAction, Getter as RootGetter, Mutation as RootMutation, State as RootState } from 'vuex-facing-decorator'
export * from './create-store'

export type Action<T = unknown, R = unknown> = (payload: T) => Promise<R>
