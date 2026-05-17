/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { mount, flushPromises } from '@vue/test-utils'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { describe, expect, it } from 'vitest'
import Form from './Form.global.vue'

class SimpleDto {
  @IsNotEmpty()
  name!: string

  @IsOptional()
  description?: string
}

function makeForm(opts: { initialData?: Record<string, unknown>; autoDirty?: boolean } = {}) {
  return mount(Form, {
    props: {
      validation: SimpleDto,
      initialData: opts.initialData,
      autoDirty: opts.autoDirty ?? false,
      noReset: true,
      action: async (data: Record<string, unknown>) => data,
    },
    slots: {
      default: `
        <template #default="{ validated, dirty }">
          <span data-validated="true" :data-is-validated="validated" :data-dirty="dirty" />
        </template>
      `,
    },
  })
}

describe('Form validated state — without autoDirty', () => {
  it('starts as validated=true (no errors yet) when no child fields are registered', async () => {
    // validation only runs when dirty or autoDirty; with neither, errors stay empty and validated=true
    const wrapper = makeForm()
    await flushPromises()
    const span = wrapper.find('[data-validated="true"]')
    expect(span.attributes('data-is-validated')).toBe('true')
  })
})

describe('Form validated state — with autoDirty', () => {
  it('starts invalid when required fields are empty and autoDirty=true', async () => {
    const wrapper = makeForm({ autoDirty: true })
    await flushPromises()
    const vm = wrapper.vm as InstanceType<typeof Form>
    // no form-field children registered so formData is {}; name is missing and validation fails
    expect(vm.validationErrors.some((e) => e.property === 'name')).toBe(true)
  })

  it('runs validation immediately (formData from registered fields, not raw initialData)', async () => {
    // Without FormField children, collect() returns {} so name is missing and errors even with initialData.
    // This confirms autoDirty triggers validation on mount rather than waiting for dirty state.
    const wrapper = makeForm({ initialData: { name: 'Alice' }, autoDirty: true })
    await flushPromises()
    const vm = wrapper.vm as InstanceType<typeof Form>
    // Validation ran (errors array is populated) — contrast with no-autoDirty where it stays empty
    expect(vm.validationErrors.length).toBeGreaterThan(0)
  })
})

describe('Form.validated getter', () => {
  it('returns true when validationErrors is empty', async () => {
    const wrapper = makeForm()
    await flushPromises()
    expect((wrapper.vm as InstanceType<typeof Form>).validated).toBe(true)
  })
})
