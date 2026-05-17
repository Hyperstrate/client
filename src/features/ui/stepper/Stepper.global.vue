<template lang="pug">
div(v-bind="$attrs")
  slot(name="header" :steps="config.steps" :current-step="step" :current-step-progress="currentStepProgress" :next="next" :previous="previous")
    stepper-header(:steps="config.steps" :current-step="step" :current-step-progress="currentStepProgress" :next="next" :previous="previous")
  div(ref="stepsWrapper" class="steps-wrapper overflow-hidden")
    transition(:name="transitionName" mode="out-in" @before-leave="onBeforeLeave" @enter="onEnter" @after-enter="onAfterEnter")
      component(:is="stepComponent" v-if="stepComponent" v-bind="$attrs" :ref="setStepRef" class="w-full")
</template>

<script lang="ts">
import { ObjectProp } from '@/util/prop-decorators'
import { Component as ComponentType, markRaw } from 'vue'
import { Component, Ref, Vue, Watch } from 'vue-facing-decorator'
import { type StepperConfig } from './model'
import StepMixin from './step.mixin'
import StepperHeader from './StepperHeader.vue'

type StepperEmits = {
  (e: 'complete'): void
  (e: string): void
}

@Component({ inheritAttrs: false, components: { StepperHeader }, emits: ['complete'] })
export default class Stepper<T = unknown> extends Vue {
  @ObjectProp(() => ({}))
  private readonly initialConfig!: Partial<StepperConfig<T>>

  declare public $emit: StepperEmits

  public config!: StepperConfig<T>
  public step = 1
  private direction: 'forward' | 'back' = 'forward'

  @Ref()
  public readonly stepsWrapper!: HTMLElement

  private stepComponentRef?: StepMixin<T>

  private get stepComponent(): ComponentType | undefined {
    return markRaw(this.config.steps[this.step - 1]?.component)
  }

  private setStepRef(el: unknown): void {
    this.stepComponentRef = el as StepMixin<T>
  }

  private created(): void {
    this.config = this.createConfig()
  }

  private createConfig(): StepperConfig<T> {
    return Object.assign<StepperConfig<T>, Partial<StepperConfig<T>>>({ steps: [], data: {} }, this.initialConfig)
  }

  public complete(): void {
    this.step = 1
    this.$emit('complete')
  }

  public get transitionName(): string {
    return this.direction === 'forward' ? 'stepper-forward' : 'stepper-back'
  }

  public next(): void {
    if (this.isComplete) {
      return this.complete()
    }
    this.direction = 'forward'
    void this.step++
  }

  public previous(): void {
    if (this.step === 1) {
      return
    }
    this.direction = 'back'
    void this.step--
  }

  public get isComplete(): boolean {
    return this.config.steps.length === this.step
  }

  public get currentStepProgress(): number {
    return this.stepComponentRef?.progress ?? 0
  }

  public onBeforeLeave(): void {
    const wrapper = this.stepsWrapper
    wrapper.style.height = wrapper.offsetHeight + 'px'
  }

  public onEnter(el: Element): void {
    const targetHeight = (el as HTMLElement).offsetHeight
    requestAnimationFrame(() => {
      const wrapper = this.stepsWrapper
      wrapper.style.height = targetHeight + 'px'
    })
  }

  public onAfterEnter(): void {
    const wrapper = this.stepsWrapper
    wrapper.style.height = 'auto'
  }

  @Watch('initialConfig')
  private onInitialConfigChange(): void {
    this.config = this.createConfig()
  }
}
</script>

<style lang="scss" scoped>
.steps-wrapper {
  transition: height 0.17s ease;
}

.stepper-forward-enter-active,
.stepper-forward-leave-active,
.stepper-back-enter-active,
.stepper-back-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.17s ease;
}

.stepper-forward-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.stepper-forward-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.stepper-back-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.stepper-back-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
