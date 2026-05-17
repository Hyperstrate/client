<template lang="pug">
form(class="flex flex-col" @submit.prevent)
  slot(v-bind="{ formData, dirty, isPathDirty, allDirty, busy, validated, submit, reset, apiError }")
</template>

<script lang="ts">
import Busyable, { Busy } from '@/features/ui/mixins/busyable'
import { parseApiError } from '@/util/get-api-error-message'
import { Mixins } from '@/util/mixin'
import { BooleanProp, FunctionProp, ObjectProp } from '@/util/prop-decorators'
import { type Constructor } from 'types'
import { Component } from 'vue-facing-decorator'
import FormContext from './form-context'
import { FormSubmittedEvent, type FormAction, type FormDataRecord } from './model'

type FormEmits = {
  (e: 'submitted', value: FormSubmittedEvent): void
  (e: string): void
}

@Component
export default class Form extends Mixins(Busyable, FormContext) {
  declare public $emit: FormEmits

  @ObjectProp()
  public readonly initialData?: FormDataRecord

  @FunctionProp()
  private readonly action?: FormAction

  @BooleanProp()
  private readonly noReset!: boolean

  @ObjectProp()
  private readonly validation?: Constructor

  protected getInitialData(): FormDataRecord | undefined {
    return this.initialData
  }

  public getValidation(): Constructor | undefined {
    return this.validation
  }

  public get validated(): boolean {
    return this.validationErrors.length === 0
  }

  @Busy()
  private async submit(param?: unknown): Promise<void> {
    this.clearApiErrors()
    const data = this.collect()

    if (this.action) {
      try {
        const result = await this.action(data, param)
        this.$emit('submitted', { data, result } as FormSubmittedEvent)
        if (!this.noReset) {
          this.reset()
        }
      } catch (err) {
        console.error(err)
        const { error, fields } = parseApiError(err)
        this.setApiErrors(error, fields)
      }
    } else if (!this.noReset) {
      this.reset()
    }
  }
}
</script>

<style lang="scss" scoped></style>
