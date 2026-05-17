<template lang="pug">
ui-tooltip(:content="tooltip")
  span(class="inline-flex h-5 w-5 items-center justify-center align-middle")
    ui-icon(:icon="icon" :size="20" class="shrink-0")
</template>

<script lang="ts">
import AgentsMixin from '@/features/core/components/mixins/agents.mixin'
import { type Agent } from '@/features/core/model'
import { Size } from '@/features/ui/clickables/model'
import { Mixins } from '@/util/mixin'
import { StringProp } from '@/util/prop-decorators'
import { type Component as VueComponent } from 'vue'
import { Component } from 'vue-facing-decorator'

@Component
export default class AgentBadge extends Mixins(AgentsMixin) {
  @StringProp()
  public readonly agent!: string | undefined

  public get meta(): Agent {
    return this.resolveAgent(this.agent)
  }

  public get tooltip(): string {
    return this.agent ? `${this.meta.label} (${this.agent})` : this.meta.label
  }

  public get icon(): string | VueComponent {
    return this.meta.icons?.[Size.SM] ?? 'ai'
  }
}
</script>
