import { isEmpty } from '@/util/lang'
import { BooleanProp } from '@/util/prop-decorators'
import { validator } from '@/util/validator'
import { type ValidationError } from 'class-validator'
import { get, isEqual } from 'lodash'
import { type Constructor } from 'types'
import { Component, Vue, Watch } from 'vue-facing-decorator'
import type FormComponent from './form-component'
import { type FormDataRecord } from './model'

export const FORM_CONTEXT = Symbol('FORM_CONTEXT')

@Component({
  provide(this: FormComponent) {
    return { [FORM_CONTEXT]: this }
  },
})
export default class FormContext extends Vue {
  @BooleanProp(false)
  public readonly autoDirty!: boolean

  @BooleanProp(false)
  public readonly validateInitially!: boolean

  private formComponents: FormComponent[] = []
  public validationErrors: ValidationError[] = []
  public apiError?: string = undefined
  public apiFieldErrors: Record<string, string[]> = {}

  // not reactive on purpose
  private previousFormData?: FormDataRecord

  protected get formData(): FormDataRecord {
    const formData = this.collect()

    return this.previousFormData === undefined || !isEqual(formData, this.previousFormData) ? formData : this.previousFormData
  }

  protected get dirty(): boolean {
    return this.formComponents.some(({ dirty }) => dirty)
  }

  protected get allDirty(): boolean {
    return this.formComponents.filter(({ required }) => required).every(({ dirty }) => dirty)
  }

  protected isPathDirty(path: string): boolean {
    return this.formComponents.find((value) => value.path === path)?.dirty ?? false
  }

  public getInitialValue(path?: string, defaultValue?: unknown): unknown {
    const initialData = this.getInitialData()

    return initialData === undefined || path === undefined ? defaultValue : get(initialData, path, defaultValue)
  }

  private collectMatching(errors: ValidationError[], targetPath: string, currentPath: string = ''): ValidationError[] {
    return errors.flatMap((error) => {
      const newPath = currentPath
        ? Number.isFinite(Number(error.property))
          ? `${currentPath}[${error.property}]`
          : `${currentPath}.${error.property}`
        : error.property

      let results: ValidationError[] = []
      if (newPath === targetPath && error.constraints) {
        results.push(error)
      }
      if (error.children && error.children.length > 0) {
        results = results.concat(this.collectMatching(error.children, targetPath, newPath))
      }
      return results
    })
  }

  public setApiErrors(error: string, fields: Record<string, string[]> = {}): void {
    this.apiError = error
    this.apiFieldErrors = { ...fields }
  }

  public clearApiErrors(): void {
    this.apiError = undefined
    this.apiFieldErrors = {}
  }

  public clearApiFieldError(path: string): void {
    delete this.apiFieldErrors[path]
  }

  public getApiFieldErrors(path: string): string[] {
    return this.apiFieldErrors[path] ?? []
  }

  public getValidationErrorsForPath(path: string): ValidationError[] {
    const validation = this.getValidation()
    if (validation === undefined) {
      return []
    }

    const matches = this.collectMatching(this.validationErrors, path)

    return matches
  }

  public registerFormComponent(component: FormComponent): void {
    if (!this.formComponents.includes(component)) {
      this.formComponents.push(component)
    }
  }

  public unregisterFormComponent(component: FormComponent): void {
    this.formComponents = this.formComponents.filter((registeredComponent) => registeredComponent !== component)
  }

  protected getInitialData(): FormDataRecord | undefined {
    return undefined
  }

  protected reset(): void {
    this.formComponents.forEach((component) => component.reset())
  }

  protected collect(): FormDataRecord {
    return this.formComponents.reduce((data, component) => component.populate(data), {})
  }

  protected getValidation(): Constructor | undefined {
    return undefined
  }

  protected mounted(): void {
    if (this.validateInitially || this.autoDirty) {
      this.validate()
    }
  }

  private validate(): void {
    const validation = this.getValidation()
    if (validation === undefined) return
    this.validationErrors = validator(validation, this.formData)
  }

  @Watch('formData', { deep: true })
  protected onFormDataChangeValidate(): void {
    if (this.dirty || this.autoDirty || this.validateInitially) {
      this.validate()
    }
  }
}
