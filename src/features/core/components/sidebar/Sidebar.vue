<template lang="pug">
nav(
  class="flex flex-col h-full bg-gray-50 border-r border-gray-200 transition-[width] duration-200 ease-in-out overflow-hidden shrink-0"
  :class="collapsed ? 'w-14' : 'w-64'"
)
  //- Brand
  div(class="h-12 flex items-center gap-2 shrink-0 border-b border-gray-200 px-4")
    div(class="w-6 h-6 rounded-md bg-zinc-900 flex items-center justify-center shrink-0")
      span(class="text-white text-xs font-bold leading-none select-none") H
    span(
      class="overflow-hidden whitespace-nowrap text-sm font-bold text-gray-900 transition-[max-width,opacity] duration-200 ease-in-out"
      :class="collapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'"
    ) Hyperstrate

  //- Nav items
  ul(class="flex-1 flex flex-col list-none p-2 overflow-y-auto overflow-x-hidden gap-0")
    template(v-for="(group, gi) in groupedApps" :key="group.key")
      //- Group separator
      li(v-if="gi > 0" class="pt-2 pb-0.5 px-2.5")
        div(data-test="sidebar-group-marker" class="relative overflow-hidden transition-[height,opacity] duration-200 ease-in-out" :class="collapsed ? 'h-px' : 'h-2.5'")
          span(
            data-test="sidebar-group-label"
            class="absolute left-0 top-0 block whitespace-nowrap text-2xs font-semibold uppercase leading-none tracking-widest text-gray-400 transition-[opacity,transform] duration-200 ease-in-out"
            :class="collapsed ? '-translate-y-1 opacity-0' : 'translate-y-0 opacity-100'"
          ) {{ group.label }}
          span(
            data-test="sidebar-group-rule"
            class="absolute inset-x-0 top-0 border-t border-gray-200 transition-opacity duration-150 ease-in-out"
            :class="collapsed ? 'opacity-100' : 'opacity-0'"
          )
      //- Apps in group
      li(v-for="app in group.apps" :key="app.name" class="mt-0.5")
        ui-tooltip(:content="app.label")
          ui-clickable(
            tag="button"
            type="button"
            class="w-full flex items-center gap-3 py-2 rounded-lg transition-colors text-left px-2.5"
            :class="isAppActive(app) ? 'bg-gray-200 text-gray-950' : 'text-gray-600 hover:bg-gray-200'"
            @click="onAppClick(app)"
          )
            ui-icon(:icon="app.icon" :size="18" class="shrink-0")
            span(
              class="overflow-hidden whitespace-nowrap text-sm font-semibold transition-[max-width,opacity] duration-200 ease-in-out"
              :class="collapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'"
            ) {{ app.label }}

  //- Toggle button
  div(class="p-2 border-t border-gray-200 shrink-0")
    ui-tooltip(:content="collapsed ? 'Expand sidebar' : 'Collapse sidebar'")
      ui-clickable(
        tag="button"
        type="button"
        class="w-full flex items-center gap-2 px-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors py-1.5"
        data-test="sidebar-toggle"
        @click="toggle"
      )
        ui-icon(:icon="collapsed ? 'arrow-right' : 'arrow-left'" :size="16" class="shrink-0")
        span(
          class="overflow-hidden whitespace-nowrap text-xs transition-[max-width,opacity] duration-200 ease-in-out"
          :class="collapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'"
        ) Collapse
</template>

<script lang="ts">
import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'
import { App, appOrderCompare } from '../../model'
import AppsMixin from '../mixins/apps.mixin'

const LS_KEY = 'hyperstrate:sidebar-collapsed'

const GROUP_ORDER = ['', 'configure', 'test', 'observe', 'manage'] as const
const GROUP_LABELS: Record<string, string> = {
  configure: 'Configure',
  test: 'Test',
  observe: 'Observe',
  manage: 'Manage',
}

interface AppGroup {
  key: string
  label: string
  apps: App[]
}

@Component
export default class Sidebar extends Mixins(AppsMixin) {
  public collapsed = false

  public mounted(): void {
    this.collapsed = localStorage.getItem(LS_KEY) === '1'
  }

  public toggle(): void {
    this.collapsed = !this.collapsed
    localStorage.setItem(LS_KEY, this.collapsed ? '1' : '0')
  }

  public onAppClick(app: App): void {
    if (app.link?.to) void this.$router.push(app.link.to)
  }

  public get groupedApps(): AppGroup[] {
    const byGroup: Record<string, App[]> = {}
    for (const app of Object.values(this.appMap).sort(appOrderCompare)) {
      const g = app.group ?? ''
      ;(byGroup[g] ??= []).push(app)
    }
    return GROUP_ORDER.filter((g) => byGroup[g]?.length).map((g) => ({ key: g || '_home', label: GROUP_LABELS[g] ?? '', apps: byGroup[g] }))
  }
}
</script>
