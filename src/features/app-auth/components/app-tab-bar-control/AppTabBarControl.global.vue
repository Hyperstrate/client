<template lang="pug">
div(class="h-full flex flex-col gap-3")
  ui-tab-bar(:model-value="activeTab" class="shrink-0" @update:model-value="onTabChange")
    ui-tab-button(v-for="tab in tabs" :key="tab.id" :value="tab.id")
      | {{ tab.label }}

  div(class="flex-1 min-h-0 overflow-hidden")
    AppApiKeysTab(v-if="activeTab === 'api-keys'")
    AppVirtualKeysTab(v-if="activeTab === 'virtual-keys'")
    AppTeamsTab(v-if="activeTab === 'teams'")
    AppUsersTab(v-if="activeTab === 'users'")
    AppSSOGroupsTab(v-if="activeTab === 'sso-groups'")
</template>

<script lang="ts">
import { Component } from 'vue-facing-decorator'
import { Vue } from 'vue-facing-decorator'
import AppApiKeysTab from './AppApiKeysTab.vue'
import AppTeamsTab from './AppTeamsTab.vue'
import AppUsersTab from './AppUsersTab.vue'
import AppSSOGroupsTab from './AppSSOGroupsTab.vue'
import AppVirtualKeysTab from './AppVirtualKeysTab.vue'

const TABS = [
  { id: 'api-keys', label: 'API Keys' },
  { id: 'virtual-keys', label: 'Virtual Keys' },
  { id: 'teams', label: 'Teams' },
  { id: 'users', label: 'Users' },
  { id: 'sso-groups', label: 'SSO Groups' },
] as const

type TabId = (typeof TABS)[number]['id']

@Component({ components: { AppApiKeysTab, AppVirtualKeysTab, AppTeamsTab, AppUsersTab, AppSSOGroupsTab } })
export default class AppTabBarControl extends Vue {
  public readonly tabs = TABS

  public get activeTab(): TabId {
    const tab = this.$route.query.tab
    return this.isTabId(tab) ? tab : 'api-keys'
  }

  public onTabChange(tab: string): void {
    if (!this.isTabId(tab) || tab === this.activeTab) return
    void this.$router.replace({ query: { ...this.$route.query, tab } })
  }

  private isTabId(tab: unknown): tab is TabId {
    return typeof tab === 'string' && TABS.some((item) => item.id === tab)
  }
}
</script>
