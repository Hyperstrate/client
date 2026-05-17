/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DefineComponent, ExtractPropTypes, ComponentOptionsMixin, PublicProps, ComponentProvideOptions } from 'vue'

type __VLS_WithSlots<T, S> = T & {
  new (): { $slots: S }
}

export type ComponentType<
  TProps extends Record<string, any> = {},
  TEmits extends Record<string, any> = {},
  TSlots extends Record<string, any> = {},
> = __VLS_WithSlots<
  DefineComponent<
    TProps,
    {},
    {},
    {},
    {},
    ComponentOptionsMixin,
    ComponentOptionsMixin,
    TEmits,
    string,
    PublicProps,
    TProps & TEmits,
    {},
    {},
    {},
    {},
    string,
    ComponentProvideOptions,
    true,
    {},
    any
  >,
  TSlots
>
