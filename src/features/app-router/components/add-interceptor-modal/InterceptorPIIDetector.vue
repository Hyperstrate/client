<template lang="pug">
div(class="flex flex-col gap-4")
  div(class="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 flex flex-col gap-2")
    p(class="text-xs font-medium text-gray-600") Detected entity types
    div(class="flex flex-wrap gap-1")
      ui-pill(v-for="e in entityTypes" :key="e" :variant="Variant.Gray") {{ e }}
  div(class="flex flex-col gap-1")
    ui-form-field(input="ui-input-checkbox" path="redact" label="Redact detected PII (replace with [REDACTED])" :default-value="defaultRedact")
    p(class="text-xs text-gray-400") When unchecked, requests containing PII are blocked outright.
</template>

<script lang="ts">
import { Variant } from '@/features/ui/clickables/model'
import { Component, Vue } from 'vue-facing-decorator'
import { BooleanProp } from '@/util/prop-decorators'

@Component
export default class InterceptorPIIDetector extends Vue {
  public Variant = Variant
  public readonly entityTypes = ['Email', 'Phone', 'SSN', 'Credit card', 'IPv4', 'IPv6', 'IBAN', 'Passport', "Driver's licence", 'AWS key', 'API key']

  @BooleanProp()
  public readonly defaultRedact!: boolean
}
</script>
