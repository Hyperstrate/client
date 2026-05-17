import { HyperstrateServerInternalModulesAuthDomainUserRole } from '@/__generated__/hyperstrate-api'
import { type Option } from '@/features/ui/inputs/model'

export const USER_ROLE_OPTIONS: Option<HyperstrateServerInternalModulesAuthDomainUserRole>[] = [
  { value: HyperstrateServerInternalModulesAuthDomainUserRole.UserRoleAdmin, label: 'Admin' },
  { value: HyperstrateServerInternalModulesAuthDomainUserRole.UserRoleMember, label: 'Member' },
]
