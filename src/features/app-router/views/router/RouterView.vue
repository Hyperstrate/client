<template lang="pug">
ui-layout(use="core-default-layout")
  div(class="flex flex-col h-full overflow-hidden")
    //- Top bar
    div(class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white shrink-0")
      ui-clickable(
        tag="button"
        class="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors text-gray-500 shrink-0"
        @click="$router.push({ name: 'AppRouter' })"
      )
        ui-icon(icon="arrow-left" :size="20")
      div(class="w-px h-4 bg-gray-200 shrink-0")
      template(v-if="router")
        div(class="flex items-center gap-2 flex-1 min-w-0")
          h1(class="text-sm font-semibold text-gray-900 truncate") {{ router.name }}
          ui-badge(:variant="Variant.Blue") {{ strategyLabel }}
        ui-dropdown(align="end")
          template(#trigger)
            ui-clickable(
              tag="button"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors"
              :class="statusButtonClasses"
              :disabled="togglingStatus"
            )
              div(class="w-1.5 h-1.5 rounded-full shrink-0" :class="statusDot")
              | {{ statusLabel }}
              ui-icon(icon="chevron-down" :size="10" class="opacity-50")
          template(#content="{ close }")
            div(class="p-1 flex flex-col")
              ui-clickable(
                v-for="opt in statusOptions"
                :key="opt.value"
                tag="button"
                class="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-left rounded-md transition-colors"
                :class="router.status === opt.value ? 'text-gray-900 font-semibold bg-gray-50' : 'text-gray-600 hover:bg-gray-50'"
                @click="setStatus(opt.value), close()"
              )
                div(class="w-1.5 h-1.5 rounded-full shrink-0" :class="opt.dot")
                | {{ opt.label }}
      div(v-else v-loading="true")

    //- View mode navigation
    div(class="flex shrink-0 overflow-x-auto border-b border-zinc-200 bg-white px-4 py-2")
      div(class="flex min-w-max items-start gap-4")
        div(class="flex flex-col gap-1")
          span(class="pointer-events-none select-none px-1 text-xs font-semibold uppercase tracking-wide text-zinc-400") Design
          ui-tab-bar(:model-value="viewMode" variant="pill" class="w-fit" @update:model-value="onViewChange")
            ui-tab-button(v-for="vt in designViewTabs" :key="vt.value" :value="vt.value") {{ vt.label }}
        div(class="flex flex-col gap-1")
          span(class="pointer-events-none select-none px-1 text-xs font-semibold uppercase tracking-wide text-zinc-400") Operate
          ui-tab-bar(:model-value="viewMode" variant="pill" class="w-fit" @update:model-value="onViewChange")
            ui-tab-button(v-for="vt in operateViewTabs" :key="vt.value" :value="vt.value") {{ vt.label }}
        div(class="flex flex-col gap-1")
          span(class="pointer-events-none select-none px-1 text-xs font-semibold uppercase tracking-wide text-zinc-400") Improve
          ui-tab-bar(:model-value="viewMode" variant="pill" class="w-fit" @update:model-value="onViewChange")
            ui-tab-button(v-for="vt in improveViewTabs" :key="vt.value" :value="vt.value") {{ vt.label }}

    //- Visual builder
    div(v-if="viewMode === 'config'" class="flex flex-1 overflow-hidden bg-zinc-100")
      app-router-add-target-modal(v-if="router" ref="addTargetModalRef" :router-id="router.id" :strategy="router.strategy" @added="onTargetAdded")
      app-router-add-feature-modal(v-if="router" ref="addFeatureModalRef" :router-id="router.id" :targets="targets" @added="onFeatureAdded")
      app-router-add-interceptor-modal(v-if="router" ref="addInterceptorModalRef" :router-id="router.id" :targets="targets" @added="onInterceptorAdded")

      aside(class="w-80 shrink-0 border-r border-zinc-200 bg-white flex flex-col")
        div(class="px-4 py-4 border-b border-zinc-100 flex flex-col gap-4")
          div(class="flex items-start justify-between gap-3")
            div(class="flex min-w-0 flex-col")
              span(class="text-xs font-semibold uppercase tracking-wide text-zinc-400") Router builder
              ui-tooltip(:content="router && router.name")
                span(class="truncate text-base font-semibold text-zinc-950") {{ router && router.name }}
            div(class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white")
              ui-icon(icon="sparkles" :size="16")

        div(class="flex-1 overflow-y-auto p-3")
          div(class="flex flex-col gap-2")
            span(class="px-1 text-xs font-semibold uppercase tracking-wide text-zinc-400") Add to router
            ui-clickable(
              tag="button"
              class="group w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left shadow-xs transition-colors hover:border-emerald-200 hover:bg-emerald-50/60"
              @click="openAddTarget"
            )
              div(
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 transition-colors group-hover:bg-emerald-500 group-hover:text-white"
              )
                ui-icon(icon="router" :size="16")
              div(class="flex min-w-0 flex-1 flex-col")
                span(class="text-sm font-semibold text-zinc-900") Model target
                span(class="truncate text-xs text-zinc-500") Endpoint pool
              ui-icon(icon="plus" :size="14" class="shrink-0 text-zinc-300 transition-colors group-hover:text-emerald-600")
            ui-clickable(
              tag="button"
              class="group w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left shadow-xs transition-colors hover:border-purple-200 hover:bg-purple-50/60"
              @click="openAddFeature"
            )
              div(
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 transition-colors group-hover:bg-purple-500 group-hover:text-white"
              )
                ui-icon(icon="sparkles" :size="16")
              div(class="flex min-w-0 flex-1 flex-col")
                span(class="text-sm font-semibold text-zinc-900") Pipeline feature
                span(class="truncate text-xs text-zinc-500") Limits, cache, transforms
              ui-icon(icon="plus" :size="14" class="shrink-0 text-zinc-300 transition-colors group-hover:text-purple-600")
            ui-clickable(
              tag="button"
              class="group w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left shadow-xs transition-colors hover:border-indigo-200 hover:bg-indigo-50/60"
              @click="openAddInterceptor"
            )
              div(
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 transition-colors group-hover:bg-indigo-500 group-hover:text-white"
              )
                ui-icon(icon="shield" :size="16")
              div(class="flex min-w-0 flex-1 flex-col")
                span(class="text-sm font-semibold text-zinc-900") Routing interceptor
                span(class="truncate text-xs text-zinc-500") Safety, split, route
              ui-icon(icon="plus" :size="14" class="shrink-0 text-zinc-300 transition-colors group-hover:text-indigo-600")

          div(class="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-3")
            div(class="flex items-center gap-2")
              span(class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-500 shadow-xs")
                ui-icon(icon="git-branch" :size="14")
              div(class="min-w-0")
                p(class="text-sm font-semibold text-zinc-900") Router anatomy
                p(class="text-xs leading-4 text-zinc-500") Three building blocks define how a request moves through the router.
            div(class="mt-4 flex flex-col gap-3")
              div(class="flex gap-3")
                div(class="flex flex-col items-center")
                  span(
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-numeric font-semibold tabular-nums"
                    :class="targets.length ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-zinc-200 bg-white text-zinc-400'"
                  ) 1
                  span(class="mt-1 h-full w-px bg-zinc-200")
                div(class="min-w-0 flex-1 pb-1")
                  p(class="text-sm font-semibold text-zinc-900") Model targets
                  p(class="mt-0.5 text-xs leading-5 text-zinc-500") The enabled model endpoints available for final selection and fallback.
              div(class="flex gap-3")
                div(class="flex flex-col items-center")
                  span(
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-numeric font-semibold tabular-nums"
                    :class="interceptors.length ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-zinc-200 bg-white text-zinc-400'"
                  ) 2
                  span(class="mt-1 h-full w-px bg-zinc-200")
                div(class="min-w-0 flex-1 pb-1")
                  p(class="text-sm font-semibold text-zinc-900") Routing interceptors
                  p(class="mt-0.5 text-xs leading-5 text-zinc-500") Ordered phase-5 logic that can block, mask, split, or choose a target.
              div(class="flex gap-3")
                div(class="flex flex-col items-center")
                  span(
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-numeric font-semibold tabular-nums"
                    :class="features.length ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-zinc-200 bg-white text-zinc-400'"
                  ) 3
                div(class="min-w-0 flex-1")
                  p(class="text-sm font-semibold text-zinc-900") Pipeline features
                  p(class="mt-0.5 text-xs leading-5 text-zinc-500") Ordered features for limits, budget, cache, transforms, retry, health, and response handling.

          router-lint-panel(v-if="router" class="mt-4" :router-id="router.id" :refresh-key="lintRefreshKey")

      div(class="flex-1 overflow-hidden relative p-4")
        app-router-router-diagram(
          v-if="router"
          :router="router"
          :targets="targets"
          :features="sortedFeatures"
          :interceptors="sortedInterceptors"
          :model-definition-key-map="modelDefinitionKeyMap"
          :model-display-name-map="modelDisplayNameMap"
          :model-provider-map="modelProviderMap"
          class="w-full h-full rounded-2xl shadow-xs"
        )
        div(v-else class="flex items-center justify-center h-full")
          p(class="text-sm text-gray-400") Loading diagram…

      div(class="w-1/4 min-w-96 max-w-md shrink-0 border-l border-zinc-200 bg-white flex flex-col overflow-hidden")
        div(class="h-36 shrink-0 px-4 py-3 border-b border-zinc-100 flex flex-col gap-3")
          div(class="h-16 flex items-start justify-between gap-3")
            div(class="flex min-w-0 flex-1 flex-col")
              span(class="h-5 truncate text-sm font-semibold text-zinc-900") {{ activeTabLabel }}
              span(class="mt-1 h-8 overflow-hidden text-xs leading-4 text-zinc-500 line-clamp-2") {{ activeTabDescription }}
            ui-button(class="shrink-0" :size="Size.SM" :variant="quickAddVariant" @click="openQuickAdd")
              template(#before)
                ui-icon(icon="plus" :size="13")
              | Add
          ui-button-group(class="h-8 w-full" :model-value="activeTabOption" :options="tabOptions" @update:model-value="onTabOptionChange")
        div(class="relative flex-1 overflow-hidden")
          div(v-show="activeTab === 'targets'" class="absolute inset-0 overflow-y-scroll")
            router-targets-control(
              :router-id="routerId"
              :strategy="router && router.strategy"
              :targets="targets"
              @added="onTargetAdded"
              @toggled="onTargetToggled"
              @removed="onTargetRemoved"
            )
          div(v-show="activeTab === 'features'" class="absolute inset-0 overflow-y-scroll")
            router-features-control(
              v-if="router"
              :router-id="router.id"
              :features="sortedFeatures"
              :targets="targets"
              :model-display-name-map="modelDisplayNameMap"
              hide-add
              @added="onFeatureAdded"
              @toggled="onFeatureToggled"
              @reordered="features = $event"
              @removed="onFeatureRemoved"
              @updated="onFeatureUpdated"
            )
          div(v-show="activeTab === 'interceptors'" class="absolute inset-0 overflow-y-scroll")
            router-interceptors-control(
              v-if="router"
              :router-id="router.id"
              :interceptors="sortedInterceptors"
              :targets="targets"
              :model-display-name-map="modelDisplayNameMap"
              :team-name-map="teamNameById"
              hide-add
              @added="onInterceptorAdded"
              @toggled="onInterceptorToggled"
              @reordered="interceptors = $event"
              @removed="onInterceptorRemoved"
              @updated="onInterceptorUpdated"
            )

    //- Prompts
    div(v-if="viewMode === 'prompts'" class="flex flex-col flex-1 overflow-hidden bg-zinc-50")
      div(class="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden bg-white border-x border-zinc-200")
        div(class="shrink-0 border-b border-zinc-100 px-5 py-4")
          h2(class="text-base font-semibold text-zinc-950") Prompts
          p(class="mt-1 text-sm text-zinc-500") Attach a router-level prompt and optional target prompt overrides.
        div(class="flex-1 overflow-y-auto")
          router-prompts-control(
            v-if="router"
            :router-id="router.id"
            :initial-router-prompt-id="router.promptId ?? ''"
            :targets="targets"
            @target-updated="onTargetUpdated"
          )

    //- Test inference
    div(v-if="viewMode === 'inference'" class="flex flex-col flex-1 overflow-hidden bg-zinc-50")
      div(class="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden bg-white border-x border-zinc-200")
        div(class="shrink-0 border-b border-zinc-100 px-5 py-4")
          h2(class="text-base font-semibold text-zinc-950") Test inference
          p(class="mt-1 text-sm text-zinc-500") Run a request through the current router configuration.
        div(class="flex-1 overflow-y-auto")
          router-inference-control(
            v-if="router"
            :router-id="router.id"
            :initial-prompt-id="router.promptId ?? ''"
            :initial-store-payloads="router.storePayloads ?? false"
          )

    //- Settings
    div(v-if="viewMode === 'settings'" class="flex flex-col flex-1 overflow-hidden bg-zinc-50")
      div(class="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden bg-white border-x border-zinc-200")
        div(class="shrink-0 border-b border-zinc-100 px-5 py-4")
          h2(class="text-base font-semibold text-zinc-950") Router settings
          p(class="mt-1 text-sm text-zinc-500") Manage identity, delivery, budget, and lifecycle settings.
        div(class="flex-1 overflow-y-auto")
          router-settings-control(
            v-if="router"
            :router-id="router.id"
            :router-name="router.name"
            :initial-webhook-url="router.webhookUrl ?? ''"
            :budget-max-cost-usd="budgetMaxCostUsd"
            @deleted="$router.push({ name: 'AppRouter' })"
          )

    //- Logs
    div(v-if="viewMode === 'logs'" class="flex flex-col flex-1 overflow-hidden")
      router-logs-tab(v-if="router" :router-id="router.id" class="flex-1 min-h-0")

    //- A/B
    div(v-if="viewMode === 'ab'" class="flex flex-col flex-1 overflow-hidden")
      router-a-b-tab(
        v-if="router"
        :router-id="router.id"
        :interceptors="sortedInterceptors"
        :targets="targets"
        class="flex-1 min-h-0"
        @go-to-interceptors="goToInterceptors"
      )

    //- Webhooks
    div(v-if="viewMode === 'webhooks'" class="flex flex-col flex-1 overflow-hidden")
      router-webhooks-tab(v-if="router" :router-id="router.id" class="flex-1 min-h-0")

    //- Evaluations
    div(v-if="viewMode === 'evaluations'" class="flex flex-col flex-1 overflow-hidden")
      router-evaluations-tab(v-if="router" :router-id="router.id" class="flex-1 min-h-0")

    //- Analytics
    div(v-if="viewMode === 'analytics'" class="flex flex-col flex-1 overflow-hidden")
      router-analytics-tab(v-if="router" :router-id="router.id" class="flex-1 min-h-0")
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesAiApplicationModelResponse,
  HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse,
  HyperstrateServerInternalModulesRouterApplicationRouterInterceptorResponse,
  HyperstrateServerInternalModulesRouterApplicationRouterResponse,
  InternalModulesRouterInterfacesHttpRouterTargetResponse,
  InternalModulesRouterInterfacesHttpModelRef,
  HyperstrateServerInternalModulesRouterDomainRouterFeatureType,
  HyperstrateServerInternalModulesRouterDomainRouterStatus,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { Mixins } from '@/util/mixin'
import { Size, Variant } from '@/features/ui/clickables/model'
import { AsyncData } from '@/util/async-data.decorator'
import { Component, Ref } from 'vue-facing-decorator'
import type { Option } from '@/features/ui/inputs/model'
import RouterLogsTab from './RouterLogsTab.vue'
import RouterABTab from './RouterABTab.vue'
import RouterWebhooksTab from './RouterWebhooksTab.vue'
import RouterEvaluationsTab from './RouterEvaluationsTab.vue'
import RouterAnalyticsTab from './RouterAnalyticsTab.vue'
import AddTargetModal from '../../components/add-target-modal/AddTargetModal.global.vue'
import AddFeatureModal from '../../components/add-feature-modal/AddFeatureModal.global.vue'
import AddInterceptorModal from '../../components/add-interceptor-modal/AddInterceptorModal.global.vue'
import RouterTargetsControl from '../../components/router-config-panel/RouterTargetsControl.vue'
import RouterFeaturesControl from '../../components/router-config-panel/RouterFeaturesControl.vue'
import RouterInterceptorsControl from '../../components/router-config-panel/RouterInterceptorsControl.vue'
import RouterPromptsControl from '../../components/router-config-panel/RouterPromptsControl.vue'
import RouterInferenceControl from '../../components/router-config-panel/RouterInferenceControl.vue'
import RouterSettingsControl from '../../components/router-config-panel/RouterSettingsControl.vue'
import RouterLintPanel from '../../components/router-config-panel/RouterLintPanel.vue'
import { ROUTING_STRATEGY_OPTIONS } from '../../model'

type Router = HyperstrateServerInternalModulesRouterApplicationRouterResponse
type RouterTarget = InternalModulesRouterInterfacesHttpRouterTargetResponse
type RouterModelRef = InternalModulesRouterInterfacesHttpModelRef
type ModelResponse = HyperstrateServerInternalModulesAiApplicationModelResponse
type RouterFeature = HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse
type RouterInterceptor = HyperstrateServerInternalModulesRouterApplicationRouterInterceptorResponse
type RouterStatus = HyperstrateServerInternalModulesRouterDomainRouterStatus

const RS = HyperstrateServerInternalModulesRouterDomainRouterStatus
const FT = HyperstrateServerInternalModulesRouterDomainRouterFeatureType

const TABS = [
  { id: 'targets', label: 'Targets' },
  { id: 'features', label: 'Features' },
  { id: 'interceptors', label: 'Interceptors' },
] as const

const VIEW_TABS = [
  { id: 'config', label: 'Overview' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'inference', label: 'Test' },
  { id: 'settings', label: 'Settings' },
  { id: 'logs', label: 'Logs' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'ab', label: 'A/B Testing' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'evaluations', label: 'Evaluations' },
] as const

type TabId = (typeof TABS)[number]['id']
type ViewTabId = (typeof VIEW_TABS)[number]['id']
type ViewTab = (typeof VIEW_TABS)[number]
type ViewTabOption = Option<ViewTabId>
type ConfigTabOption = Option<TabId>

@Component({
  components: {
    RouterLogsTab,
    RouterABTab,
    RouterWebhooksTab,
    RouterEvaluationsTab,
    RouterAnalyticsTab,
    RouterTargetsControl,
    RouterFeaturesControl,
    RouterInterceptorsControl,
    RouterPromptsControl,
    RouterInferenceControl,
    RouterSettingsControl,
    RouterLintPanel,
  },
})
export default class RouterView extends Mixins(ApiClientsMixin, LoadingMixin) {
  public router?: Router
  public targets: RouterTarget[] = []
  public features: RouterFeature[] = []
  public interceptors: RouterInterceptor[] = []
  public modelRefsById: Record<string, RouterModelRef> = {}
  public teamNameById: Record<string, string> = {}
  public lintRefreshKey = 0

  public readonly tabs = TABS
  public readonly viewTabs = VIEW_TABS
  public togglingStatus = false
  public Size = Size
  public Variant = Variant

  public get designViewTabs(): ViewTabOption[] {
    return this.toViewOptions(VIEW_TABS.filter((tab) => tab.id === 'config' || tab.id === 'prompts' || tab.id === 'settings'))
  }

  public get operateViewTabs(): ViewTabOption[] {
    return this.toViewOptions(VIEW_TABS.filter((tab) => tab.id === 'inference' || tab.id === 'logs' || tab.id === 'analytics'))
  }

  public get improveViewTabs(): ViewTabOption[] {
    return this.toViewOptions(VIEW_TABS.filter((tab) => tab.id === 'ab' || tab.id === 'evaluations' || tab.id === 'webhooks'))
  }

  public get tabOptions(): ConfigTabOption[] {
    return TABS.map((tab) => ({ value: tab.id, label: tab.label }))
  }

  public get activeTabOption(): ConfigTabOption {
    return this.tabOptions.find((tab) => tab.value === this.activeTab) ?? this.tabOptions[0]
  }

  @Ref()
  public readonly addTargetModalRef!: AddTargetModal

  @Ref()
  public readonly addFeatureModalRef!: AddFeatureModal

  @Ref()
  public readonly addInterceptorModalRef!: AddInterceptorModal

  public get viewMode(): ViewTabId {
    const q = this.$route.query.view
    return VIEW_TABS.map((t) => t.id as string).includes(q as string) ? (q as ViewTabId) : 'config'
  }

  public get activeTab(): TabId {
    const q = this.$route.query.tab
    return TABS.map((t) => t.id as string).includes(q as string) ? (q as TabId) : 'targets'
  }

  public onViewChange(view: string): void {
    void this.$router.replace({ query: { ...this.$route.query, view } })
  }

  private toViewOptions(tabs: ViewTab[]): ViewTabOption[] {
    return tabs.map((tab) => ({ value: tab.id, label: tab.label }))
  }

  public onTabChange(tab: string): void {
    void this.$router.replace({ query: { ...this.$route.query, tab } })
  }

  public onTabOptionChange(option: ConfigTabOption): void {
    this.onTabChange(option.value)
  }

  public get activeTabLabel(): string {
    return this.tabs.find((tab) => tab.id === this.activeTab)?.label ?? 'Inspector'
  }

  public get activeTabDescription(): string {
    switch (this.activeTab) {
      case 'targets':
        return 'Models this router can send traffic to. Keep at least one active destination.'
      case 'features':
        return 'Ordered pipeline steps. Drag to change execution order.'
      case 'interceptors':
        return 'Routing and safety logic that runs in phase 5 before target selection. Drag to change order.'
      default:
        return 'Configure the selected router flow block.'
    }
  }

  public get quickAddVariant(): Variant {
    if (this.activeTab === 'targets') return Variant.Green
    if (this.activeTab === 'features') return Variant.Purple
    if (this.activeTab === 'interceptors') return Variant.Indigo
    return Variant.Gray
  }

  public openQuickAdd(): void {
    if (this.activeTab === 'features') return this.openAddFeature()
    if (this.activeTab === 'interceptors') return this.openAddInterceptor()
    return this.openAddTarget()
  }

  public openAddTarget(): void {
    void this.$router.replace({ query: { ...this.$route.query, view: 'config', tab: 'targets' } })
    this.addTargetModalRef?.open()
  }

  public openAddFeature(): void {
    void this.$router.replace({ query: { ...this.$route.query, view: 'config', tab: 'features' } })
    this.addFeatureModalRef?.open()
  }

  public openAddInterceptor(): void {
    void this.$router.replace({ query: { ...this.$route.query, view: 'config', tab: 'interceptors' } })
    this.addInterceptorModalRef?.open()
  }

  public goToInterceptors(): void {
    void this.$router.replace({ query: { ...this.$route.query, view: 'config', tab: 'interceptors' } })
  }
  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public get routerId(): string {
    return this.$route.params.id as string
  }

  public get sortedFeatures(): RouterFeature[] {
    return [...this.features].sort((a, b) => (a.executionOrder ?? 0) - (b.executionOrder ?? 0))
  }

  public get budgetMaxCostUsd(): number {
    const budgetFeature = this.features.find((f) => f.featureType === FT.FeatureBudget && f.isEnabled)
    if (!budgetFeature?.config) return 0
    return Number((budgetFeature.config as Record<string, unknown>)['max_cost_usd'] ?? 0)
  }

  public get sortedInterceptors(): RouterInterceptor[] {
    return [...this.interceptors].sort((a, b) => (a.executionOrder ?? 0) - (b.executionOrder ?? 0))
  }

  public get modelDefinitionKeyMap(): Record<string, string> {
    return Object.fromEntries(Object.entries(this.modelRefsById).map(([id, model]) => [id, model.modelDefKey ?? '']))
  }

  public get modelProviderMap(): Record<string, string> {
    return Object.fromEntries(Object.entries(this.modelRefsById).map(([id, model]) => [id, String(model.provider ?? '')]))
  }

  public get modelDisplayNameMap(): Record<string, string> {
    return Object.fromEntries(Object.entries(this.modelRefsById).map(([id, model]) => [id, model.alias || model.displayName || id]))
  }

  public get statusDot(): string {
    const s = this.router?.status
    if (!s) return 'bg-gray-400'
    return (
      {
        [RS.RouterStatusActive]: 'bg-emerald-500',
        [RS.RouterStatusDraft]: 'bg-amber-400',
        [RS.RouterStatusInactive]: 'bg-gray-400',
      }[s] ?? 'bg-gray-400'
    )
  }

  public get statusLabel(): string {
    switch (this.router?.status) {
      case RS.RouterStatusActive:
        return 'Active'
      case RS.RouterStatusInactive:
        return 'Inactive'
      case RS.RouterStatusDraft:
        return 'Draft'
      default:
        return '—'
    }
  }

  public get statusButtonClasses(): string {
    switch (this.router?.status) {
      case RS.RouterStatusActive:
        return 'bg-emerald-50 border-emerald-200 text-emerald-700'
      case RS.RouterStatusInactive:
        return 'bg-gray-50 border-gray-200 text-gray-500'
      default:
        return 'bg-amber-50 border-amber-200 text-amber-600'
    }
  }

  public readonly statusOptions = [
    { value: RS.RouterStatusActive, label: 'Active', dot: 'bg-emerald-500' },
    { value: RS.RouterStatusInactive, label: 'Inactive', dot: 'bg-gray-400' },
    { value: RS.RouterStatusDraft, label: 'Draft', dot: 'bg-amber-400' },
  ]

  public get strategyLabel(): string {
    const strategy = this.router?.strategy
    if (!strategy) return ''
    return ROUTING_STRATEGY_OPTIONS.find((o) => o.value === strategy)?.label ?? strategy
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<RouterView>> {
    this.setLoading(true)
    try {
      const [{ data: router }, { data: targets }, { data: features }, { data: interceptors }] = await Promise.all([
        this.api.routerIdGet({ id: this.routerId }),
        this.api.routerIdTargetsGet({ id: this.routerId }),
        this.api.routerIdFeaturesGet({ id: this.routerId }),
        this.api.routerIdInterceptorsGet({ id: this.routerId }),
      ])

      const resolvedTargets = await this.withResolvedTargetModels(targets)
      await Promise.all([this.resolveModelRefs(this.extractModelIds(features, interceptors)), this.resolveTeamNames(this.extractTeamIds(interceptors))])

      return { router, targets: resolvedTargets, features, interceptors }
    } finally {
      this.setLoading(false)
    }
  }

  public async setStatus(status: RouterStatus): Promise<void> {
    if (!this.router?.id || this.togglingStatus || this.router.status === status) return
    this.togglingStatus = true
    try {
      const { data } = await this.api.routerIdPatch({ id: this.router.id, body: { status } })
      this.router = data
    } finally {
      this.togglingStatus = false
    }
  }

  // ── Control event handlers ────────────────────────────────────────────────

  public onTargetAdded(t: RouterTarget): void {
    this.targets = [...this.targets, t]
    void this.resolveCurrentTargetModels()
    this.refreshLint()
  }
  public onTargetToggled(t: RouterTarget): void {
    this.targets = this.targets.map((x) => (x.id === t.id ? t : x))
    void this.resolveCurrentTargetModels()
    this.refreshLint()
  }
  public onTargetRemoved(id: string): void {
    this.targets = this.targets.filter((x) => x.id !== id)
    // Server-side event bus may have pruned A/B variants from interceptors.
    void this.refreshInterceptors()
    this.refreshLint()
  }
  public onTargetUpdated(t: RouterTarget): void {
    this.targets = this.targets.map((x) => (x.id === t.id ? t : x))
    void this.resolveCurrentTargetModels()
    this.refreshLint()
  }

  public onFeatureAdded(f: RouterFeature): void {
    this.features = [...this.features, f]
    void this.resolveModelRefs(this.extractFeatureModelIds(f))
    this.refreshLint()
  }
  public onFeatureToggled(f: RouterFeature): void {
    this.features = this.features.map((x) => (x.id === f.id ? f : x))
    this.refreshLint()
  }
  public onFeatureRemoved(id: string): void {
    this.features = this.features.filter((x) => x.id !== id)
    this.refreshLint()
  }

  public onFeatureUpdated(f: RouterFeature): void {
    this.features = this.features.map((x) => (x.id === f.id ? f : x))
    void this.resolveModelRefs(this.extractFeatureModelIds(f))
    this.refreshLint()
  }

  public onInterceptorAdded(i: RouterInterceptor): void {
    this.interceptors = [...this.interceptors, i]
    void this.resolveModelRefs(this.extractInterceptorModelIds(i))
    void this.resolveTeamNames(this.extractInterceptorTeamIds(i))
    this.refreshLint()
  }
  public onInterceptorToggled(i: RouterInterceptor): void {
    this.interceptors = this.interceptors.map((x) => (x.id === i.id ? i : x))
    this.refreshLint()
  }
  public onInterceptorRemoved(id: string): void {
    this.interceptors = this.interceptors.filter((x) => x.id !== id)
    this.refreshLint()
  }
  public onInterceptorUpdated(i: RouterInterceptor): void {
    this.interceptors = this.interceptors.map((x) => (x.id === i.id ? i : x))
    void this.resolveModelRefs(this.extractInterceptorModelIds(i))
    void this.resolveTeamNames(this.extractInterceptorTeamIds(i))
    this.refreshLint()
  }

  // ── Private helpers ───────────────────────────────────────────────────────
  private refreshLint(): void {
    this.lintRefreshKey += 1
  }

  private async refreshInterceptors(): Promise<void> {
    const { data } = await this.api.routerIdInterceptorsGet({ id: this.routerId })
    this.interceptors = data
  }

  private async resolveCurrentTargetModels(): Promise<void> {
    this.targets = await this.withResolvedTargetModels(this.targets)
  }

  private async withResolvedTargetModels(targets: RouterTarget[]): Promise<RouterTarget[]> {
    this.rememberModelRefs(
      targets
        .filter((target): target is RouterTarget & { model: RouterModelRef } => Boolean(target.modelId && target.model))
        .map((target) => [target.modelId, target.model] as const),
    )

    const modelIds = [...new Set(targets.filter((target) => this.needsModelRef(target)).map((target) => target.modelId))]
    if (!modelIds.length) return targets

    const resolvedEntries = await Promise.all(
      modelIds.map(async (id) => {
        try {
          const { data } = await this.api.aiModelsIdGet({ id })
          return [id, this.toRouterModelRef(data)] as const
        } catch {
          return undefined
        }
      }),
    )
    const resolvedById = new Map(resolvedEntries.filter((entry): entry is readonly [string, RouterModelRef] => Boolean(entry)))
    this.rememberModelRefs([...resolvedById.entries()])

    return targets.map((target) => {
      const resolved = resolvedById.get(target.modelId)
      if (!resolved) return target
      return { ...target, model: this.mergeModelRefs(target.model, resolved) }
    })
  }

  private needsModelRef(target: RouterTarget): boolean {
    return Boolean(target.modelId && (!target.model?.alias || !target.model.displayName || !target.model.modelDefKey || !target.model.provider))
  }

  private toRouterModelRef(model: ModelResponse): RouterModelRef {
    return {
      id: model.id,
      alias: model.alias,
      displayName: model.displayName,
      modelDefKey: model.modelDefinitionKey,
      provider: String(model.provider),
    }
  }

  private mergeModelRefs(current: RouterModelRef | undefined, resolved: RouterModelRef): RouterModelRef {
    return {
      ...current,
      id: current?.id || resolved.id,
      alias: current?.alias || resolved.alias,
      displayName: current?.displayName || resolved.displayName,
      modelDefKey: current?.modelDefKey || resolved.modelDefKey,
      provider: current?.provider || resolved.provider,
    }
  }

  private rememberModelRefs(entries: Array<readonly [string, RouterModelRef]>): void {
    if (!entries.length) return
    this.modelRefsById = {
      ...this.modelRefsById,
      ...Object.fromEntries(entries),
    }
  }

  private async resolveModelRefs(ids: string[]): Promise<void> {
    const missing = [...new Set(ids.filter((id) => id && !this.modelRefsById[id]))]
    if (!missing.length) return

    const entries = await Promise.all(
      missing.map(async (id) => {
        try {
          const { data } = await this.api.aiModelsIdGet({ id })
          return [id, this.toRouterModelRef(data)] as const
        } catch {
          return undefined
        }
      }),
    )
    this.rememberModelRefs(entries.filter((entry): entry is readonly [string, RouterModelRef] => Boolean(entry)))
  }

  private async resolveTeamNames(ids: string[]): Promise<void> {
    const missing = [...new Set(ids.filter((id) => id && !this.teamNameById[id]))]
    if (!missing.length) return

    const entries = await Promise.all(
      missing.map(async (id) => {
        try {
          const { data } = await this.api.authTeamsIdGet({ id })
          return [id, data.name] as const
        } catch {
          return undefined
        }
      }),
    )
    const resolved = entries.filter((entry): entry is readonly [string, string] => Boolean(entry))
    if (!resolved.length) return
    this.teamNameById = {
      ...this.teamNameById,
      ...Object.fromEntries(resolved),
    }
  }

  private extractModelIds(features: RouterFeature[], interceptors: RouterInterceptor[]): string[] {
    return [
      ...features.flatMap((feature) => this.extractFeatureModelIds(feature)),
      ...interceptors.flatMap((interceptor) => this.extractInterceptorModelIds(interceptor)),
    ]
  }

  private extractFeatureModelIds(feature: RouterFeature): string[] {
    const config = feature.config as Record<string, unknown> | undefined
    if (!config) return []
    return [config['model_id'], config['judge_model_id']].filter((id): id is string => typeof id === 'string')
  }

  private extractInterceptorModelIds(interceptor: RouterInterceptor): string[] {
    const config = interceptor.config as Record<string, unknown> | undefined
    if (!config) return []
    const ids = [config['model_id'], config['shield_model_id']].filter((id): id is string => typeof id === 'string')
    const variants = config['variants'] as Array<{ model_id?: string }> | undefined
    ids.push(...(variants ?? []).map((variant) => variant.model_id).filter((id): id is string => typeof id === 'string'))
    const budgets = config['budgets'] as Record<string, { overflow_target_id?: string }> | undefined
    ids.push(
      ...Object.values(budgets ?? {})
        .map((budget) => budget.overflow_target_id)
        .filter((id): id is string => typeof id === 'string'),
    )
    return ids
  }

  private extractTeamIds(interceptors: RouterInterceptor[]): string[] {
    return interceptors.flatMap((interceptor) => this.extractInterceptorTeamIds(interceptor))
  }

  private extractInterceptorTeamIds(interceptor: RouterInterceptor): string[] {
    const budgets = interceptor.config?.['budgets'] as Record<string, unknown> | undefined
    return Object.keys(budgets ?? {})
  }
}
</script>
