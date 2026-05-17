<template lang="pug">
story(title="Indicator")
  variant(title="Positions")
    div(class="flex flex-wrap gap-10 p-6")
      div(v-for="pos in Object.values(IndicatorPosition)" :key="pos")
        p(class="text-xs text-zinc-400 mb-2 text-center") {{ pos }}
        ui-indicator(:position="pos" :variant="Variant.Red")
          template(#content)
            div(class="w-12 h-12 rounded-lg bg-zinc-200")
          | 3
  variant(title="Variants")
    div(class="flex flex-wrap gap-6 p-4")
      ui-indicator(v-for="v in Object.values(Variant)" :key="v" :variant="v")
        template(#content)
          div(class="w-10 h-10 rounded-lg bg-zinc-200")
        | !
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { Variant } from '../../clickables/model'
import { IndicatorPosition } from '../model'

@Component
export default class IndicatorStory extends Vue {
  private Variant = Variant
  private IndicatorPosition = IndicatorPosition
  private Object = Object
}
</script>
