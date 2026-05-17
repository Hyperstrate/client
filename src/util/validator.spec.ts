import { describe, expect, it } from 'vitest'
import { IsNotEmpty, IsOptional, IsNumberString } from 'class-validator'
import { validator, validatorAsync } from './validator'

class SampleDto {
  @IsNotEmpty()
  name!: string

  @IsOptional()
  @IsNumberString()
  age?: string
}

describe('validator', () => {
  it('returns no errors for valid payload', () => {
    const errors = validator(SampleDto, { name: 'Alice' } as never)
    expect(errors).toHaveLength(0)
  })

  it('returns errors when required field is empty', () => {
    const errors = validator(SampleDto, { name: '' } as never)
    expect(errors.some((e) => e.property === 'name')).toBe(true)
  })

  it('returns errors when required field is missing', () => {
    const errors = validator(SampleDto, {} as never)
    expect(errors.some((e) => e.property === 'name')).toBe(true)
  })

  it('returns errors when optional number field has non-numeric value', () => {
    const errors = validator(SampleDto, { name: 'Bob', age: 'abc' } as never)
    expect(errors.some((e) => e.property === 'age')).toBe(true)
  })

  it('passes when optional field is omitted', () => {
    const errors = validator(SampleDto, { name: 'Bob' } as never)
    expect(errors).toHaveLength(0)
  })
})

describe('validatorAsync', () => {
  it('returns no errors for valid payload', async () => {
    const errors = await validatorAsync(SampleDto, { name: 'Alice' } as never)
    expect(errors).toHaveLength(0)
  })

  it('returns errors for invalid payload', async () => {
    const errors = await validatorAsync(SampleDto, { name: '' } as never)
    expect(errors.length).toBeGreaterThan(0)
  })
})
