<template lang="pug">
ui-modal(ref="modalRef")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    div(class="w-full")
      div(class="px-6 pt-6 pb-4 border-b border-gray-100")
        div(class="flex flex-col gap-0.5")
          h2(class="text-base font-semibold text-gray-900") New MCP Server
          p(class="text-sm text-gray-500") Register an MCP server — credentials are stored here and referenced by router features

      ui-form(ref="formRef" v-slot="{ validated, submit, busy, reset, formData }" :validation="CreateMCPServerFormData" :action="doSubmit" validate-initially)
        div(class="flex flex-col gap-4 px-6 py-5")
          ui-form-field(input="ui-input-text" path="name" label="Name" placeholder="My web search server" required)

          div(class="flex flex-col gap-1.5")
            ui-form-field(input="ui-input-text" path="url" label="URL" placeholder="https://my-mcp-server.com/mcp" required)
            p(class="text-xs text-gray-400") Streamable HTTP endpoint (JSON-RPC 2.0)

          ui-form-field(input="ui-input-select" path="authType" label="Auth type" :input-props="{ options: AuthTypeOptions }")

          ui-form-field(
            v-if="authTypeValue(formData) === AuthType.BEARER"
            input="ui-input-text"
            path="authToken"
            label="Bearer token"
            placeholder="sk-..."
            :input-props="{ password: true }"
            required
          )

          ui-form-field(
            v-if="authTypeValue(formData) === AuthType.API_KEY"
            input="ui-input-text"
            path="apiKeyHeader"
            label="Header name"
            placeholder="X-API-Key"
            required
          )

          div(v-if="authTypeValue(formData) === AuthType.API_KEY" class="flex flex-col gap-1.5")
            ui-form-field(input="ui-input-text" path="apiKeyValue" label="API key value" placeholder="sk-..." :input-props="{ password: true }" required)
            p(class="text-xs text-gray-400") Header name is sent to the server; value is the secret.

          ui-form-field(input="ui-input-text" path="description" label="Description" placeholder="Optional description")

          ui-form-field(input="ui-input-text" path="timeoutSecs" label="Timeout (seconds)" placeholder="30")

          ui-form-field(
            ref="extraHeadersFormField"
            input="ui-input-key-value"
            path="extraHeaders"
            :input-props="{ keyPlaceholder: 'X-Header-Name', valuePlaceholder: 'value' }"
          )
            template(#label)
              div(class="flex items-center justify-between mb-1")
                ui-label Custom Headers
                ui-link(:size="Size.SM" :variant="Variant.Blue" @click.prevent="addExtraHeader")
                  ui-icon(icon="plus" :size="16")
                  | Add header
            template(#inputActions="slotProps")
              ui-icon-button(
                icon="close"
                :icon-size="16"
                :size="Size.SM"
                :variant="Variant.Gray"
                class="shrink-0 !text-red-600"
                square
                @click.prevent="slotProps['on-remove']()"
              )

        div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
          ui-button(type="button" :variant="Variant.Gray" @click="reset(), close()") Cancel
          ui-button(type="button" :disabled="!validated || !isFormReady(formData)" :busy="busy" @click="submit") Create Server
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesAiApplicationCreateMCPServerInput,
  HyperstrateServerInternalModulesAiApplicationCreateMCPServerInputAuthTypeEnum as AuthType,
  HyperstrateServerInternalModulesAiApplicationMCPServerResponse,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { type Option } from '@/features/ui/inputs/model'
import { type KeyValuePair } from '@/features/ui/input-key-value/InputKeyValue.global.vue'
import { Size, Variant } from '@/features/ui/clickables/model'
import { Mixins } from '@/util/mixin'
import { IsNotEmpty, IsNumberString, IsOptional } from 'class-validator'
import { Component, Ref } from 'vue-facing-decorator'

type MCPServerResponse = HyperstrateServerInternalModulesAiApplicationMCPServerResponse
type MCPServerCreateInput = HyperstrateServerInternalModulesAiApplicationCreateMCPServerInput & {
  extraHeaders?: Record<string, string>
}

type Emits = {
  (e: 'created', value: MCPServerResponse): void
  (e: string): void
}

const AUTH_TYPE_OPTIONS: Option<AuthType>[] = [
  { value: AuthType.NONE, label: 'No auth' },
  { value: AuthType.BEARER, label: 'Bearer token' },
  { value: AuthType.API_KEY, label: 'API key header' },
]

interface KeyValueFormFieldRef {
  $refs?: { input?: { addPair?: () => void } }
}

export class CreateMCPServerFormData {
  @IsNotEmpty()
  name!: string

  @IsNotEmpty()
  url!: string

  @IsOptional()
  description?: string

  @IsOptional()
  @IsNumberString()
  timeoutSecs?: string

  @IsOptional()
  authType: Option<AuthType> = AUTH_TYPE_OPTIONS[0]

  @IsOptional()
  authToken?: string

  @IsOptional()
  apiKeyHeader: string = 'X-API-Key'

  @IsOptional()
  apiKeyValue?: string

  @IsOptional()
  extraHeaders?: KeyValuePair[]
}

@Component({ emits: ['created'] })
export default class CreateMCPServerModal extends Mixins(ApiClientsMixin) {
  public readonly AuthType = AuthType
  public readonly AuthTypeOptions = AUTH_TYPE_OPTIONS
  public readonly CreateMCPServerFormData = CreateMCPServerFormData
  public readonly Size = Size
  public readonly Variant = Variant

  @Ref()
  public readonly modalRef!: Modal

  @Ref()
  public readonly extraHeadersFormField?: KeyValueFormFieldRef

  declare public $emit: Emits

  public addExtraHeader(): void {
    this.extraHeadersFormField?.$refs?.input?.addPair?.()
  }

  public authTypeValue(formData: Record<string, unknown>): AuthType {
    return (formData.authType as Option<AuthType> | undefined)?.value ?? AuthType.NONE
  }

  public isFormReady(formData: Record<string, unknown>): boolean {
    const authType = this.authTypeValue(formData)
    if (authType === AuthType.BEARER) return !!(formData.authToken as string | undefined)?.trim()
    if (authType === AuthType.API_KEY) return !!(formData.apiKeyValue as string | undefined)?.trim()
    return true
  }

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public async doSubmit(formData: CreateMCPServerFormData): Promise<void> {
    const authType = (formData.authType as unknown as Option<AuthType>)?.value ?? AuthType.NONE
    let authToken: string | undefined
    let authHeader: string | undefined

    if (authType === AuthType.BEARER) {
      authToken = formData.authToken?.trim() || undefined
    } else if (authType === AuthType.API_KEY) {
      authToken = formData.apiKeyValue?.trim() || undefined
      authHeader = formData.apiKeyHeader?.trim() || undefined
    }

    const extraHeaders: Record<string, string> = {}
    for (const { key, value } of formData.extraHeaders ?? []) {
      if (key.trim()) extraHeaders[key.trim()] = value
    }

    const body: MCPServerCreateInput = {
      name: formData.name.trim(),
      url: formData.url.trim(),
      description: formData.description?.trim() || undefined,
      authType: authType,
      authToken,
      authHeader,
      timeoutSecs: formData.timeoutSecs ? Number(formData.timeoutSecs) : undefined,
      ...(Object.keys(extraHeaders).length > 0 && { extraHeaders }),
    }

    const { data } = await this.api.aiMcpServersPost({ body })
    this.$emit('created', data)
    this.close()
  }

  public close(): void {
    this.modalRef?.close()
  }
}
</script>
