import { type Component } from 'vue'

export interface Step {
  name: string
  component: Component
}

export interface StepperConfig<T = unknown> {
  steps: Step[]
  data?: Partial<T>
}
