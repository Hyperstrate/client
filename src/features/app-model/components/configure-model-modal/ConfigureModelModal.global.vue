<template lang="pug">
ui-modal(ref="modalRef" @close="close")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    div(class="w-full")
      //- ── Header ───────────────────────────────────────────────────────────
      div(class="px-6 pt-6 pb-4 border-b border-gray-100")
        div(class="flex flex-col gap-0.5")
          h2(class="text-base font-semibold text-gray-900") Configure Model
          p(class="text-sm text-gray-500") Endpoint, credentials and request options

      //- ── Loading ──────────────────────────────────────────────────────────
      div(v-if="loading" class="flex items-center justify-center py-16")
        span(class="text-sm text-gray-400") Loading current configuration…

      //- ── Form ─────────────────────────────────────────────────────────────
      ui-form(
        v-else
        v-slot="{ dirty, validated, busy, submit, formData }"
        :validation="ConfigureModelFormData"
        :action="configure"
        :initial-data="initialFormData"
      )
        div(class="flex flex-col gap-6 px-6 py-5")
          //- Connection
          div(class="flex flex-col gap-3")
            ui-overline Connection
            ui-form-field(input="ui-input-text" path="baseUrl" label="Base URL" :placeholder="defaultBaseUrl || 'https://api.example.com/'" required)
            ui-form-field(input="ui-input-text" path="timeoutSecs" label="Timeout (seconds)" placeholder="30")

          //- Credentials (only rendered when the model definition requires them)
          div(v-if="credentialFields.length > 0" class="flex flex-col gap-4")
            ui-overline Credentials

            div(v-for="field in credentialFields" :key="field.key" class="flex flex-col gap-3")
              //- For apiKey: show either single-key input or pool, never both
              template(v-if="field.key === 'apiKey'")
                div(class="flex flex-col gap-1.5")
                  div(class="flex items-center justify-between")
                    span(class="text-sm font-medium text-gray-700") {{ field.label }}
                    ui-status(:value="hasApiKeyOrPool" :active-label="apiKeyStatusLabel" inactive-label="Not set")

                  //- Single key input — hidden when pool mode is active
                  ui-form-field(v-if="!poolMode" input="ui-input-text" path="apiKey" label="" :placeholder="credentialPlaceholder(field)")

                //- Pool section
                div(class="flex flex-col gap-2")
                  div(class="flex items-center justify-between")
                    div(class="flex items-center gap-2")
                      span(class="text-sm font-medium text-gray-700") Key Pool
                      ui-badge(v-if="poolMode" :variant="Variant.Blue" :size="Size.SM") Active
                    div(class="flex items-center gap-2")
                      ui-link(v-if="poolMode" :size="Size.SM" :variant="Variant.Red" @click.prevent="clearPool")
                        | Clear pool
                      ui-link(:size="Size.SM" :variant="Variant.Blue" @click.prevent="addPoolKey")
                        ui-icon(icon="plus" :size="16")
                        | Add key

                  div(v-if="poolKeys.length === 0" class="rounded-lg border border-dashed border-gray-200 py-3 text-center")
                    p(class="text-xs text-gray-400")
                      | {{ poolMode ? 'All keys removed — save to clear the pool' : 'Add keys above to enable round-robin rotation' }}

                  div(v-for="(_, idx) in poolKeys" :key="idx" class="flex items-center gap-2")
                    ui-input-text(
                      :model-value="poolKeys[idx]"
                      password
                      placeholder="sk-..."
                      class="flex-1 min-w-0 font-mono"
                      @update:model-value="updatePoolKey(idx, String($event))"
                    )
                    ui-icon-button(
                      icon="close"
                      :icon-size="16"
                      :size="Size.SM"
                      :variant="Variant.Gray"
                      class="shrink-0 !text-red-600"
                      @click.prevent="removePoolKey(idx)"
                    )

              //- All other credential fields (apiSecret, etc.)
              template(v-else)
                div(class="flex flex-col gap-1.5")
                  div(class="flex items-center justify-between")
                    span(class="text-sm font-medium text-gray-700") {{ field.label }}
                    ui-status(:value="!!config?.hasApiSecret" active-label="Configured" inactive-label="Not set")
                  ui-form-field(input="ui-input-text" :path="field.key" label="" type="password" :placeholder="credentialPlaceholder(field)")

          //- Extra Headers
          ui-form-field(
            ref="headerPairsFormField"
            input="ui-input-key-value"
            path="extraHeaders"
            :input-props="{ keyPlaceholder: 'X-Header-Name', valuePlaceholder: 'value' }"
          )
            template(#label)
              div(class="flex items-center justify-between mb-1")
                ui-label Extra Headers
                ui-link(:size="Size.SM" :variant="Variant.Blue" @click.prevent="addHeaderPair")
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

        //- ── Footer ───────────────────────────────────────────────────────
        div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
          ui-button(type="button" :variant="Variant.Gray" @click="close") Cancel
          ui-button(:disabled="!(dirty || headersChanged(formData) || poolModified) || !validated" :busy="busy" @click="submit") Save
</template>

<script lang="ts">
import type {
  HyperstrateServerInternalModulesAiDomainCredentialFieldDef,
  HyperstrateServerInternalModulesAiApplicationModelConfigurationResponse,
  HyperstrateServerInternalModulesAiApplicationSetModelConfigurationInput,
} from '@/__generated__/hyperstrate-api'
import { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { Mixins } from '@/util/mixin'
import { IsNotEmpty, IsNumberString, IsOptional } from 'class-validator'
import { Size, Variant } from '@/features/ui/clickables/model'
import { Component, Ref } from 'vue-facing-decorator'
import { AsyncData } from '@/util/async-data.decorator'
import { ArrayProp, StringProp } from '@/util/prop-decorators'

export class ConfigureModelFormData {
  @IsNotEmpty()
  baseUrl!: string

  @IsOptional()
  apiKey?: string

  @IsOptional()
  apiSecret?: string

  @IsOptional()
  @IsNumberString()
  timeoutSecs?: string

  @IsOptional()
  extraHeaders?: HeaderPair[]
}

interface HeaderPair {
  key: string
  value: string
}

interface KeyValueFormFieldRef {
  $refs?: { input?: { addPair?: () => void } }
}

type ConfigureModelModalEmits = {
  (e: 'configured'): void
  (e: string): void
}

@Component({ emits: ['configured'] })
export default class ConfigureModelModal extends Mixins(ApiClientsMixin, LoadingMixin) {
  public Variant = Variant
  public Size = Size

  public readonly ConfigureModelFormData = ConfigureModelFormData

  @StringProp(true)
  public readonly modelId!: string

  @ArrayProp(() => [])
  public readonly credentialFields!: HyperstrateServerInternalModulesAiDomainCredentialFieldDef[]

  @StringProp()
  public readonly defaultBaseUrl?: string

  declare public $emit: ConfigureModelModalEmits

  @Ref()
  public readonly modalRef!: Modal

  @Ref()
  public readonly headerPairsFormField?: KeyValueFormFieldRef

  public config?: HyperstrateServerInternalModulesAiApplicationModelConfigurationResponse
  public savedHeaderPairs: HeaderPair[] = []

  // Pool key state. poolMode=true means the server has a pool configured
  // OR the user started adding keys. poolKeys holds new keys being entered;
  // they are never pre-filled since the server never returns secret values.
  public poolMode: boolean = false
  public poolKeys: string[] = []
  // poolModified becomes true as soon as the user touches any pool control,
  // which enables the Save button independently of the form's dirty flag.
  public poolModified: boolean = false

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public get hasApiKeyOrPool(): boolean {
    return !!this.config?.hasApiKey || (this.config?.apiKeyPoolSize ?? 0) > 0
  }

  public get apiKeyStatusLabel(): string {
    const poolSize = this.config?.apiKeyPoolSize ?? 0
    if (poolSize > 0) return `${poolSize} key${poolSize === 1 ? '' : 's'} in pool`
    return 'Configured'
  }

  public addHeaderPair(): void {
    this.headerPairsFormField?.$refs?.input?.addPair?.()
  }

  public headersChanged(formData: Record<string, unknown>): boolean {
    const headerPairs = (formData.extraHeaders as HeaderPair[] | undefined) ?? []
    if (headerPairs.length !== this.savedHeaderPairs.length) return true
    return headerPairs.some((p, i) => {
      const s = this.savedHeaderPairs[i]
      return !s || p.key !== s.key || p.value !== s.value
    })
  }

  public get initialFormData(): Partial<ConfigureModelFormData> {
    return {
      baseUrl: this.config?.baseUrl ?? (this.defaultBaseUrl || 'https://api.example.com/'),
      timeoutSecs: this.config?.timeoutSecs ? String(this.config.timeoutSecs) : undefined,
      extraHeaders: this.savedHeaderPairs.map((p) => ({ ...p })),
    }
  }

  public credentialPlaceholder(field: HyperstrateServerInternalModulesAiDomainCredentialFieldDef): string {
    const isSet = field.key === 'apiKey' ? this.config?.hasApiKey : this.config?.hasApiSecret
    if (isSet) return 'Leave blank to keep existing'
    return `Enter ${field.label.toLowerCase()}`
  }

  public addPoolKey(): void {
    this.poolKeys.push('')
    this.poolMode = true
    this.poolModified = true
  }

  public removePoolKey(idx: number): void {
    this.poolKeys.splice(idx, 1)
    this.poolModified = true
  }

  public updatePoolKey(idx: number, value: string): void {
    this.poolKeys.splice(idx, 1, value)
    this.poolModified = true
  }

  public clearPool(): void {
    this.poolKeys = []
    this.poolMode = false
    this.poolModified = true
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<ConfigureModelModal>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.aiModelsIdConfigurationGet({ id: this.modelId })
      const pairs = Object.entries(data.extraHeaders ?? {})
        .filter(([k]) => k)
        .map(([key, value]) => ({ key, value: value ?? '' }))

      return {
        config: data,
        savedHeaderPairs: pairs,
        // Pool keys are always entered fresh — the server never returns secret values.
        // poolMode=true when the server already has a pool, so the UI reflects that.
        poolMode: (data.apiKeyPoolSize ?? 0) > 0,
        poolKeys: [],
        poolModified: false,
      }
    } catch {
      this.config = undefined
      this.savedHeaderPairs = []
      this.poolMode = false
      this.poolKeys = []
      this.poolModified = false
      throw new Error('Failed to load model configuration')
    } finally {
      this.setLoading(false)
    }
  }

  public async configure(formData: ConfigureModelFormData): Promise<void> {
    const extraHeaders: Record<string, string> = {}
    for (const { key, value } of formData.extraHeaders ?? []) {
      if (key.trim()) extraHeaders[key.trim()] = value
    }

    // Determine what to send for apiKeyPool:
    // - poolModified=false: undefined (preserve whatever the server has)
    // - poolModified=true, poolKeys non-empty: filtered list (replace pool)
    // - poolModified=true, poolKeys empty: [] (clear pool)
    let apiKeyPool: string[] | undefined
    if (this.poolModified) {
      apiKeyPool = this.poolKeys.filter((k) => k.trim())
    }

    const body: HyperstrateServerInternalModulesAiApplicationSetModelConfigurationInput = {
      baseUrl: formData.baseUrl,
      apiKey: formData.apiKey || undefined,
      apiSecret: formData.apiSecret || undefined,
      timeoutSecs: formData.timeoutSecs ? Number(formData.timeoutSecs) : undefined,
      extraHeaders: Object.keys(extraHeaders).length > 0 ? extraHeaders : undefined,
      apiKeyPool,
    }
    await this.api.aiModelsIdConfigurationPut({ id: this.modelId, body })
    this.$emit('configured')
    this.close()
  }

  public close(): void {
    this.modalRef.close()
  }
}
</script>
