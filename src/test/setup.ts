/* eslint-disable vue/one-component-per-file */
import { config } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

const UiClickableStub = defineComponent({
  name: 'UiClickableStub',
  props: {
    tag: { type: String, default: 'button' },
  },
  emits: ['click'],
  setup(props, { attrs, emit, slots }) {
    return () =>
      h(
        props.tag,
        {
          ...attrs,
          onClick: (event: MouseEvent) => emit('click', event),
        },
        slots.default?.(),
      )
  },
})

const ButtonStub = defineComponent({
  name: 'ButtonStub',
  emits: ['click'],
  setup(_, { attrs, emit, slots }) {
    return () =>
      h(
        'button',
        {
          ...attrs,
          onClick: (event: MouseEvent) => emit('click', event),
        },
        slots.default?.(),
      )
  },
})

config.global.stubs = {
  'ui-clickable': UiClickableStub,
  'ui-icon': defineComponent({
    setup:
      (_, { attrs, slots }) =>
      () =>
        h('span', { 'data-test': 'icon', ...attrs }, slots.default?.()),
  }),
  'ui-icon-button': ButtonStub,
  'ui-input-checkbox': defineComponent({
    setup:
      (_, { attrs }) =>
      () =>
        h('input', { ...attrs, type: 'checkbox' }),
  }),
  'ui-label': defineComponent({
    setup:
      (_, { attrs, slots }) =>
      () =>
        h('label', attrs, slots.default?.()),
  }),
}

config.global.directives = {
  loading: {
    mounted: () => undefined,
    updated: () => undefined,
  },
}
