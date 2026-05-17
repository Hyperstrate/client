<template lang="pug">
div(class="min-h-screen flex items-center justify-center bg-gray-50")
  div(class="w-full max-w-sm")
    div(class="bg-white rounded-2xl border border-gray-200 shadow-xs p-8 flex flex-col gap-8")
      div(class="text-center flex flex-col gap-1")
        h1(class="text-2xl font-bold text-gray-900")
          | Welcome to Hyperstrate
        p(class="text-sm text-gray-500")
          | Set up your organisation to get started

      ui-form(v-slot="{ validated, submit, busy, dirty }" :validation="SetupFormData" :action="doSubmit")
        div(class="flex flex-col gap-4")
          ui-form-field(input="ui-input-text" path="orgName" label="Organisation name" placeholder="Acme Corp" required)
          ui-button(type="button" :disabled="!dirty || !validated" :busy="busy" class="w-full" @click="submit")
            | Create organisation
</template>

<script lang="ts">
import { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Mixins } from '@/util/mixin'
import { SET_ID_TOKEN, SET_SETUP_REQUIRED } from '@/features/core/store/create-store'
import { IsNotEmpty } from 'class-validator'
import { Component } from 'vue-facing-decorator'

export class SetupFormData {
  @IsNotEmpty()
  orgName!: string
}

@Component
export default class SetupView extends Mixins(ApiClientsMixin) {
  public readonly SetupFormData = SetupFormData

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public async doSubmit(formData: SetupFormData): Promise<void> {
    await this.api.authSetupPost({ body: { orgName: formData.orgName.trim() } })
    this.$store.commit(SET_SETUP_REQUIRED, false)
    // Re-issue the session token so it carries the new orgId.
    const { data } = await this.api.authRefreshPost()
    const refreshed = data
    this.$store.commit(SET_ID_TOKEN, {
      ...this.$store.state.idToken!,
      accessToken: refreshed.token,
      user: refreshed.user,
    })
    void this.$router.replace({ name: 'AppHome' })
  }
}
</script>
