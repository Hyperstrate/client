<template lang="pug">
story(title="Form")
  variant(title="Text fields")
    div(class="w-80")
      ui-form(v-slot="{ validated, busy, submit: doSubmit }" :validation="ContactFormData" :action="submit")
        div(class="flex flex-col gap-4")
          ui-form-field(input="ui-input-text" path="name" label="Name" placeholder="Full name" required)
          ui-form-field(input="ui-input-text" path="email" label="Email" placeholder="you@example.com" required)
          ui-form-field(input="ui-input-textarea" path="message" label="Message" placeholder="Write something…")
          ui-button(:disabled="!validated" :busy="busy" @click="doSubmit") Submit
  variant(title="With select")
    div(class="w-80")
      ui-form(v-slot="{ validated, busy, submit: doSubmit }" :validation="RoleFormData" :action="submit")
        div(class="flex flex-col gap-4")
          ui-form-field(input="ui-input-text" path="username" label="Username" required)
          ui-form-field(input="ui-input-select" path="role" label="Role" :input-props="{ options: roleOptions }")
          ui-button(:disabled="!validated" :busy="busy" @click="doSubmit") Save
  variant(title="Error state")
    div(class="w-80")
      ui-form(v-slot="{ validated, busy, submit: doSubmit, apiError }" :validation="ContactFormData" :action="submitError")
        div(class="flex flex-col gap-4")
          ui-form-field(input="ui-input-text" path="name" label="Name" placeholder="Full name" required)
          ui-form-field(input="ui-input-text" path="email" label="Email" placeholder="you@example.com" required)
          p(v-if="apiError" class="text-sm text-red-600") {{ apiError }}
          ui-button(:disabled="!validated" :busy="busy" @click="doSubmit") Submit (will error)
</template>

<script lang="ts">
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator'
import { Component, Vue } from 'vue-facing-decorator'
import { type Option } from '../../inputs/model'

export class ContactFormData {
  @IsNotEmpty()
  name!: string

  @IsNotEmpty()
  @IsEmail()
  email!: string

  @IsOptional()
  message?: string
}

export class RoleFormData {
  @IsNotEmpty()
  username!: string

  @IsOptional()
  role?: Option<string>
}

@Component
export default class FormStory extends Vue {
  public readonly ContactFormData = ContactFormData
  public readonly RoleFormData = RoleFormData

  public roleOptions: Option<string>[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'editor', label: 'Editor' },
    { value: 'viewer', label: 'Viewer' },
  ]

  public async submit(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 600))
  }

  public async submitError(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 600))
    throw new Error('Server returned 500')
  }
}
</script>
