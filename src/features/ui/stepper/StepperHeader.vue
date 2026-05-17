<template lang="pug">
div(v-for="(step, index) in steps" :key="index" class="flex flex-col items-center gap-3")
  | {{ step.name }}
</template>

<script lang="ts">
import { Component } from 'vue-facing-decorator'
import StepperHeaderMixin from './stepper-header.mixin'

@Component
export default class StepperHeader extends StepperHeaderMixin {}
</script>
