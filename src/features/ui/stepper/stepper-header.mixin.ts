import { Component, Vue } from 'vue-facing-decorator'
import { type Step } from './model'
import { ArrayProp, NumberProp } from '@/util/prop-decorators'
import Stepper from './Stepper.global.vue'

@Component
export default class StepperHeaderMixin<T = unknown> extends Vue {
  @ArrayProp(() => [])
  protected readonly steps!: Step[]

  @NumberProp()
  protected readonly currentStep!: number

  @NumberProp()
  protected readonly currentStepProgress!: number

  private _stepper!: InstanceType<typeof Stepper>

  public get stepper(): InstanceType<typeof Stepper> {
    return this._stepper
  }

  public next(): void {
    void this.stepper.next()
  }

  public previous(): void {
    void this.stepper.previous()
  }

  protected isActive(index: number): boolean {
    return index === this.currentStep - 1
  }

  protected isCompleted(index: number): boolean {
    return index < this.currentStep - 1
  }

  protected getProgress(index: number): number {
    if (this.isCompleted(index)) {
      return 100
    }
    if (this.isActive(index)) {
      return this.currentStepProgress
    }
    return 0
  }

  protected getProgressStyle(index: number): Record<string, string> {
    const progress = this.getProgress(index)
    const circumference = 2 * Math.PI * 45
    const offset = circumference - (progress / 100) * circumference

    return {
      strokeDasharray: `${circumference}`,
      strokeDashoffset: `${offset}`,
    }
  }

  private created(): void {
    let parent = this.$parent
    const stepperName = Stepper.name

    while (parent) {
      if (parent.$options.name === stepperName) {
        this._stepper = parent as InstanceType<typeof Stepper>
        return
      }
      parent = parent.$parent
    }

    throw new Error(`${String(this.$options.name)} is not a child of ${stepperName} component`)
  }
}
