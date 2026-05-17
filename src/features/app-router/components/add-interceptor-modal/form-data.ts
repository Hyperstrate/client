import { HyperstrateServerInternalModulesRouterDomainRouterInterceptorType } from '@/__generated__/hyperstrate-api'
import { IsEnum, IsNotEmpty, IsNumberString, IsOptional, ValidateIf, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

const IT = HyperstrateServerInternalModulesRouterDomainRouterInterceptorType

class ABVariantData {
  @IsNotEmpty()
  name!: string

  @IsNotEmpty()
  modelId!: unknown

  @IsOptional()
  @IsNumberString()
  weight?: string
}

class TeamBudgetData {
  @IsNotEmpty()
  teamId!: unknown

  @IsOptional()
  @IsNumberString()
  maxCostUsd?: string

  @IsOptional()
  @IsNumberString()
  maxRequests?: string

  @IsOptional()
  overflowTargetId?: unknown
}

export class AddInterceptorFormData {
  @IsNotEmpty()
  @IsEnum(Object.values(HyperstrateServerInternalModulesRouterDomainRouterInterceptorType))
  type!: HyperstrateServerInternalModulesRouterDomainRouterInterceptorType

  @ValidateIf((o: AddInterceptorFormData) => o.type === IT.InterceptorSemanticClassifier)
  @IsNotEmpty()
  modelId?: unknown

  @IsOptional()
  @IsNumberString()
  similarityThreshold?: string

  @IsOptional()
  abPartitionKey?: string

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ABVariantData)
  abVariants?: ABVariantData[]

  @ValidateIf((o: AddInterceptorFormData) => o.type === IT.InterceptorContentFilter)
  @IsNotEmpty()
  blockedPatterns?: string

  @IsOptional()
  redact?: boolean

  @IsOptional()
  sensitivity?: string

  @ValidateIf((o: AddInterceptorFormData) => o.type === IT.InterceptorPromptShield)
  @IsNotEmpty()
  shieldPolicies?: string

  @IsOptional()
  shieldModelId?: unknown

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TeamBudgetData)
  teamBudgets?: TeamBudgetData[]
}
