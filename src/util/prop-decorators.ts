import { isBoolean, isDef, isString } from '@/util/lang'
import { Prop } from 'vue-facing-decorator'

type PropDecorator = ReturnType<typeof Prop>

export function RequiredProp(): PropDecorator {
  return Prop({ required: true })
}

export function OptionalProp(def: unknown = undefined): PropDecorator {
  return Prop({ required: false, default: def })
}

type DateFactory = () => Date

/**
 * A date component property.
 *
 * @param def The default value or a boolean indicating if this property is
 *    required. Defaults to false. If a default value is given, the property is
 *    not required.
 */
export function DateProp(def: DateFactory | boolean = false): PropDecorator {
  return Prop({
    type: Date,
    required: def === true,
    default: isBoolean(def) ? undefined : def,
  })
}

/**
 * A string component property.
 *
 * @param def The default value or a boolean indicating if this property is
 *    required. Defaults to false. If a default value is given, the property is
 *    not required.
 */
export function StringProp(def: string | boolean = false): PropDecorator {
  return Prop({
    type: String,
    required: def === true,
    default: isBoolean(def) ? undefined : def,
  })
}

/**
 * A component property with enumerated string values.
 *
 * @param def The default value or a boolean indicating if this property is
 *    required. Defaults to false. If a default value is given, it is added to
 *    the list of allowed values and the property is not required.
 * @param values Allowed values
 */
export function EnumProp(def: string | boolean = false, ...values: Array<string>): PropDecorator {
  if (isString(def)) {
    values.push(def)
  }

  return Prop({
    type: String,
    required: def === true,
    default: isBoolean(def) ? undefined : def,
    validator: (value: string) => values.indexOf(value) !== -1,
  })
}

type NumberValidator = (value: number) => boolean

/**
 * A number component property with optional limits and additional validators.
 *
 * @param def The default value or a boolean indicating if this property is
 *    required. Defaults to false. If a default value is given, the property is
 *    not required. The default value is not checked for the given constraints.
 * @param min Minimum value allowed
 * @param max Maximum value allowed
 * @param validators Additional validators receiving the number as their first
 *    argument and returning a boolean to indicate, if the number is accepted
 *    as a value of this prop.
 */
export function NumberProp(def: number | boolean = false, min?: number, max?: number, ...validators: NumberValidator[]): PropDecorator {
  if (isDef(min)) {
    validators.push((value) => value >= min)
  }

  if (isDef(max)) {
    validators.push((value) => value <= max)
  }

  return Prop({
    type: Number,
    required: def === true,
    default: isBoolean(def) ? undefined : def,
    validator: (value: number) => validators.every((validator) => validator(value)),
  })
}

/**
 * A integer component property with optional limits and additional validators.
 *
 * @param def The default value or a boolean indicating if this property is
 *    required. Defaults to false. If a default value is given, the property is
 *    not required. The default value is not checked for the given constraints.
 * @param min Minimum value allowed
 * @param max Maximum value allowed
 * @param validators Additional validators receiving the number as their first
 *    argument and returning a boolean to indicate, if the number is accepted
 *    as a value of this prop.
 */
export function IntegerProp(def: number | boolean = false, min?: number, max?: number, ...validators: NumberValidator[]): PropDecorator {
  return NumberProp(def, min, max, Number.isInteger, ...validators)
}

/**
 * A component property that contains a valid CSS length value. Allowed are
 * numbers (which will be interpreted as pixels) and strings (which should be
 * compatible to values accepted by CSS, but are not further checked by this
 * property).
 *
 * @param def The default value or a boolean indicating if this property is
 *    required. Defaults to false. If a default value is given the property is
 *    not required.
 */
export function LengthProp(def: string | number | boolean = false): PropDecorator {
  return Prop({
    type: [String, Number],
    required: def === true,
    default: isBoolean(def) ? undefined : def,
    validator: (value: string | number) => typeof value === 'string' || value >= 0,
  })
}

/**
 * A boolean component property.
 *
 * @param def The default value. Defaults to false.
 */
export function BooleanProp(def = false): PropDecorator {
  return Prop({
    type: Boolean,
    default: def,
  })
}

type ArrayFactory = () => unknown[]

/**
 * A component property that contains an array.
 *
 * @param def The default value factory or a boolean indicating if this property
 *    is required. Defaults to false. If a default value is given the property
 *    is not required.
 */
export function ArrayProp(def: ArrayFactory | boolean = false): PropDecorator {
  return Prop({
    type: Array,
    required: def === true,
    default: isBoolean(def) ? undefined : def,
  })
}

type ObjectFactory<T> = () => T
type Constructor<T> = new (...args: unknown[]) => T

/**
 * An optional component property that contains an object.
 */
export function ObjectProp(): PropDecorator
/**
 * A component property that contains an object.
 *
 * @param required A boolean indicating if this property is required.
 * @param ctor If given, the object must be an instance of this constructor.
 */
export function ObjectProp(required: boolean, ctor?: Constructor<unknown>): PropDecorator
/**
 * A optional component property with a default value that contains an object.
 *
 * @param def The factory function to create the default value.
 * @param ctor If given, the object must be an instance of this constructor.
 */
export function ObjectProp<T>(def: ObjectFactory<T>, ctor?: Constructor<T>): PropDecorator
export function ObjectProp(def: ObjectFactory<unknown> | boolean = false, ctor?: Constructor<unknown>): PropDecorator {
  return Prop({
    type: ctor ?? undefined,
    required: def === true,
    default: isBoolean(def) ? undefined : def,
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- using generics in decorators typing is wonky
type Callback = (...args: any[]) => any

/**
 * A component property that contains a function.
 *
 * @param def The default value or a boolean indicating if this property is
 *    required. Defaults to false. If a default value is given the property
 *    is not required.
 */
export function FunctionProp(def: Callback | boolean = false): PropDecorator {
  return Prop({
    type: Function,
    required: def === true,
    default: isBoolean(def) ? undefined : def,
  })
}
