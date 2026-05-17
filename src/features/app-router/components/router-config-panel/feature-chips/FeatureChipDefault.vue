<template lang="pug">
div(class="flex items-center gap-2 px-3 py-2.5 cursor-grab active:cursor-grabbing")
  slot(name="drag-handle")
  div(class="w-1.5 h-1.5 rounded-full shrink-0" :class="feature.isEnabled ? 'bg-purple-500' : 'bg-gray-300'")
  div(class="flex-1 min-w-0")
    p(class="text-xs font-medium text-gray-800 truncate") {{ label }}
  slot(name="actions")
</template>

<script lang="ts">
import { HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse } from '@/__generated__/hyperstrate-api'
import { Component, Vue } from 'vue-facing-decorator'
import { RequiredProp, StringProp } from '@/util/prop-decorators'

type RouterFeature = HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse

@Component
export default class FeatureChipDefault extends Vue {
  @StringProp(true)
  public readonly label!: string

  @RequiredProp()
  public readonly feature!: RouterFeature
}
</script>
