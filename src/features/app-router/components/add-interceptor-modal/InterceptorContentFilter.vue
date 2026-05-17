<template lang="pug">
div(class="flex flex-col gap-1.5")
  ui-form-field(
    input="ui-input-textarea"
    path="blockedPatterns"
    label="Blocked patterns"
    required
    placeholder="violence\nadult content\ngambling"
    :default-value="defaultPatterns"
  )
  div(v-if="parsedPatterns.length" class="flex flex-wrap gap-1 pt-0.5")
    ui-pill(v-for="pat in parsedPatterns" :key="pat" :variant="Variant.Red") {{ pat }}
  p(class="text-xs text-gray-400") One pattern per line. Matched against the full prompt (case-insensitive).
</template>

<script lang="ts">
import { Variant } from '@/features/ui/clickables/model'
import { Component, Vue } from 'vue-facing-decorator'
import { ObjectProp, StringProp } from '@/util/prop-decorators'
import { splitTrimmedLines } from '@/util/string'

@Component
export default class InterceptorContentFilter extends Vue {
  public Variant = Variant

  @ObjectProp(() => ({}))
  public readonly formData!: Record<string, unknown>

  @StringProp()
  public readonly defaultPatterns?: string

  public get parsedPatterns(): string[] {
    return splitTrimmedLines(this.formData.blockedPatterns)
  }
}
</script>
