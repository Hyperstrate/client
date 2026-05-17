import { plainToInstance } from 'class-transformer'
import { type ValidationError, type ValidatorOptions } from 'class-validator'
import { validate, validateSync } from 'class-validator'
import { type Constructor } from 'types'

export function validator<T extends Constructor>(validatorClass: T, payload: InstanceType<T>, validatorOptions?: ValidatorOptions): ValidationError[] {
  const entity = plainToInstance<InstanceType<T>, T>(validatorClass, payload) as InstanceType<T>
  const errors = validateSync(entity, validatorOptions)

  return errors
}

export async function validatorAsync<T extends Constructor>(
  validatorClass: T,
  payload: InstanceType<T>,
  validatorOptions?: ValidatorOptions,
): Promise<ValidationError[]> {
  const entity = plainToInstance<InstanceType<T>, T>(validatorClass, payload) as InstanceType<T>
  const errors = await validate(entity, validatorOptions)

  return errors
}
