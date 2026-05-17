<template lang="pug">
ui-clickable(
  type="text"
  :disabled="model === page"
  class="flex justify-center items-center h-8 w-8 text-sm rounded-md select-none transition-colors"
  :class="model === page ? 'bg-zinc-900 text-white font-medium' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'"
  @click="model = page"
)
  slot
    span {{ page }}
</template>

<script lang="ts">
import { IntegerProp } from '@/util/prop-decorators'
import { Component, Model, Vue } from 'vue-facing-decorator'

@Component
export default class PageButton extends Vue {
  @Model({ type: Number, required: true })
  public model!: number

  @IntegerProp(true, 1)
  public page!: number
}
</script>
