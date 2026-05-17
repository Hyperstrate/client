import { isString } from '@/util/lang'
import { BooleanProp, OptionalProp, StringProp } from '@/util/prop-decorators'
import { type ValidationError } from 'class-validator'
import { cloneDeep, get, isEqual, set } from 'lodash'
import { Component, Inject, Vue } from 'vue-facing-decorator'
import type FormContext from './form-context'
import { FORM_CONTEXT } from './form-context'
import { type FormDataRecord, type Transformer } from './model'

function formContextMissing(): never {
  throw new Error('FORM_CONTEXT missing')
}

function transform(transformer: string | Transformer | undefined, value: unknown): unknown {
  if (transformer === undefined) {
    return value
  }

  if (isString(transformer)) {
    return get(value, transformer)
  }

  return transformer(value)
}

@Component
export default class FormComponent extends Vue {
  @StringProp()
  public readonly path?: string

  @StringProp()
  private readonly initialPath?: string

  @OptionalProp()
  private readonly transformer?: string | Transformer

  @OptionalProp()
  private readonly initialTransformer?: string | Transformer

  @OptionalProp()
  private readonly initialValue?: unknown

  @OptionalProp()
  private readonly defaultValue?: unknown

  @BooleanProp(false)
  public readonly required!: boolean

  public valueHolder?: { value: unknown }

  @Inject({ from: FORM_CONTEXT, default: formContextMissing })
  private readonly formContext!: FormContext

  public get dirty(): boolean {
    return this.valueHolder !== undefined && !isEqual(this.valueHolder.value, this.modelValue)
  }

  private get modelValue(): unknown {
    const base = this.initialValue !== undefined ? this.initialValue : this.formContext.getInitialValue(this.initialPath ?? this.path, this.defaultValue)
    return transform(this.initialTransformer, base)
  }

  public get value(): unknown {
    return this.valueHolder ? this.valueHolder.value : this.modelValue
  }

  public set value(value: unknown) {
    this.valueHolder = { value }
  }

  public reset(): void {
    this.value = undefined
  }

  public populate(data: FormDataRecord): FormDataRecord {
    if (this.path !== undefined) {
      const transformedValue = transform(this.transformer, this.resolveValue() ?? this.defaultValue)

      // files can't be copied with cloneDeep
      if (transformedValue instanceof File) {
        set(data, this.path, new File([transformedValue], transformedValue.name, { type: transformedValue.type }))
      } else {
        set(data, this.path, cloneDeep(transformedValue))
      }
    }

    return data
  }

  public get validationErrors(): ValidationError[] {
    if (this.path === undefined) {
      return []
    }
    return this.formContext.getValidationErrorsForPath(this.path)
  }

  public get apiFieldErrors(): string[] {
    if (this.path === undefined) return []
    return this.formContext.getApiFieldErrors(this.path)
  }

  public clearApiFieldError(): void {
    if (this.path !== undefined) {
      this.formContext.clearApiFieldError(this.path)
    }
  }

  protected resolveValue(): unknown {
    return this.value ?? this.defaultValue
  }

  protected mounted(): void {
    this.formContext.registerFormComponent(this)
  }

  protected beforeUnmount(this: FormComponent): void {
    this.formContext.unregisterFormComponent(this)
  }
}
