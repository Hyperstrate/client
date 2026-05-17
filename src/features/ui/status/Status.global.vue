<template lang="pug">
ui-pill(:variant="value ? activeVariant : inactiveVariant")
  slot {{ value ? activeLabel : inactiveLabel }}
</template>

<script lang="ts">
import { BooleanProp, StringProp } from '@/util/prop-decorators'
import { Component, Vue } from 'vue-facing-decorator'
import { Variant } from '../clickables/model'

@Component
export default class Status extends Vue {
  @BooleanProp(false)
  public readonly value!: boolean

  @StringProp('Active')
  public readonly activeLabel!: string

  @StringProp('Disabled')
  public readonly inactiveLabel!: string

  @StringProp(Variant.Green)
  public readonly activeVariant!: string

  @StringProp(Variant.Gray)
  public readonly inactiveVariant!: string
}
</script>
