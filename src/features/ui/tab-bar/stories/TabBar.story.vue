<template lang="pug">
story(title="TabBar")
  variant(title="Default")
    ui-tab-bar(v-model="activeTab")
      ui-tab-button(value="overview") Overview
      ui-tab-button(value="settings") Settings
      ui-tab-button(value="logs") Logs
    div(class="mt-4 p-4 bg-zinc-50 rounded text-sm text-zinc-600")
      | Active tab: {{ activeTab }}
  variant(title="Many tabs")
    ui-tab-bar(v-model="activeTab2")
      ui-tab-button(v-for="tab in manyTabs" :key="tab.value" :value="tab.value")
        | {{ tab.label }}
  variant(title="Pill")
    ui-tab-bar(v-model="activeTab3" variant="pill" class="w-fit")
      ui-tab-button(value="targets") Targets
      ui-tab-button(value="features") Features
      ui-tab-button(value="interceptors") Interceptors
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class TabBarStory extends Vue {
  activeTab = 'overview'
  activeTab2 = 'tab1'
  activeTab3 = 'targets'

  manyTabs = [
    { value: 'tab1', label: 'General' },
    { value: 'tab2', label: 'Security' },
    { value: 'tab3', label: 'Billing' },
    { value: 'tab4', label: 'Notifications' },
    { value: 'tab5', label: 'Integrations' },
    { value: 'tab6', label: 'API Keys' },
    { value: 'tab7', label: 'Audit Log' },
  ]
}
</script>
