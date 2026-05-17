import { Component, Vue } from 'vue-facing-decorator'
import Stepper from './Stepper.global.vue'

@Component
export default class StepMixin<T = unknown> extends Vue {
  private _stepper!: InstanceType<typeof Stepper>

  public get stepper(): InstanceType<typeof Stepper> {
    return this._stepper
  }

  public get valid(): boolean {
    return true
  }

  public next(): void {
    void this.stepper.next()
  }

  public get currentStepNumber(): number {
    return this.stepper.step
  }

  public get progress(): number {
    return 0
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
