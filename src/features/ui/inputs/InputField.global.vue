<template lang="pug">
div(class="flex flex-col gap-1")
  slot(name="label" :label="label")
    ui-label(v-if="label" class="flex items-center gap-2")
      | {{ label }}
      span(v-if="required" class="text-red-500") *
      span(v-if="!required && optional" class="text-zinc-400") (optional)
      ui-tooltip(v-if="errorContent")
        template(#trigger)
          ui-icon(icon="info" :size="12" class="text-red-500")
        template(#content)
          div(v-if="errorMessages.length > 0" class="flex flex-col px-4 py-2")
            span(v-for="(message, index) of errorMessages" :key="index" class="m-0 text-red-600") {{ message }}
  slot
  transition-group(v-if="errorMessages.length" name="field-error" tag="div")
    p(v-for="msg in errorContent ? errorMessages : []" :key="msg" class="overflow-hidden text-xs text-red-500") {{ msg }}
</template>

<script lang="ts">
import { ArrayProp, StringProp, BooleanProp } from '@/util/prop-decorators'
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class InputField extends Vue {
  @StringProp()
  private readonly label?: string

  @BooleanProp()
  private readonly error!: boolean

  @BooleanProp(false)
  private readonly required!: boolean

  @BooleanProp(false)
  private readonly optional!: boolean

  @ArrayProp(() => [])
  private readonly errorMessages!: string[]

  private get errorContent(): boolean {
    return this.error && this.errorMessages.length > 0
  }
}
</script>

<style scoped>
.field-error-enter-active,
.field-error-leave-active {
  transition:
    max-height 0.2s ease,
    opacity 0.2s ease;
  overflow: hidden;
  max-height: 60px;
}
.field-error-enter-from,
.field-error-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
