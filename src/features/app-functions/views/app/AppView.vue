<template lang="pug">
ui-layout(use="core-default-layout")
  div(class="h-full flex flex-col")
    div(class="max-w-screen-xl w-full mx-auto px-4 pt-8 pb-4 shrink-0")
      domain-ui-page-header(title="Functions" subtitle="Python functions, runner pools, invocations, and logs")
        template(#actions)
          ui-button(:size="Size.SM" :variant="Variant.Gray" :busy="loading" @click="asyncData")
            template(#before)
              ui-icon(icon="refresh" :size="15")
            | Refresh
          app-functions-create-runner-pool-modal(@created="onRunnerPoolCreated")
            template(#trigger)
              ui-button(:size="Size.SM" :variant="Variant.Gray")
                template(#before)
                  ui-icon(icon="database" :size="15")
                | Runner Pool
          app-functions-create-functions-app-modal(@created="onAppCreated")
            template(#trigger)
              ui-button(:size="Size.SM")
                template(#before)
                  ui-icon(icon="plus" :size="15")
                | New App

    div(class="flex-1 min-h-0 overflow-y-auto")
      div(class="max-w-screen-xl mx-auto px-4 pb-8 flex flex-col gap-5")
        ui-tab-bar(v-model="activeTab" variant="pill" class="w-full max-w-sm")
          ui-tab-button(value="functions") Functions
          ui-tab-button(value="runners") Runners

        template(v-if="activeTab === 'functions'")
          div(class="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-5 items-start")
            div(class="flex flex-col gap-3")
              div(class="flex items-center justify-between gap-3")
                h2(class="text-sm font-semibold text-gray-800") Apps
                span(class="text-xs text-gray-400 font-numeric tabular-nums") {{ apps.length }}

              div(v-if="loading" v-loading="true" class="py-12")
              div(v-else-if="apps.length === 0" class="py-16 text-center border border-dashed border-gray-200 rounded-xl bg-white")
                p(class="text-sm font-medium text-gray-400") No apps yet
              div(v-else class="flex flex-col gap-2")
                ui-clickable(
                  v-for="app in apps"
                  :key="app.id"
                  tag="button"
                  class="bg-white border rounded-xl p-4 text-left transition-all hover:border-blue-300"
                  :class="selectedAppId === app.id ? 'border-blue-300 shadow-xs' : 'border-gray-200'"
                  @click="selectApp(app)"
                )
                  div(class="flex items-start justify-between gap-3")
                    div(class="min-w-0 flex flex-col gap-1")
                      span(class="text-sm font-semibold text-gray-900 truncate") {{ app.name }}
                      span(v-if="app.description" class="text-xs text-gray-500 line-clamp-2") {{ app.description }}
                      span(class="text-xs text-gray-400") {{ formatDate(app.createdAt) }}
                    ui-icon(icon="chevron-right" :size="16" class="text-gray-300 shrink-0")

            div(class="min-w-0 flex flex-col gap-5")
              div(v-if="!selectedApp" class="py-20 text-center border border-dashed border-gray-200 rounded-xl bg-white")
                p(class="text-sm font-medium text-gray-400") Select an app
              template(v-else)
                div(class="flex flex-wrap items-center justify-between gap-3")
                  div(class="min-w-0 flex flex-col gap-0.5")
                    h2(class="text-base font-semibold text-gray-900 truncate") {{ selectedApp.name }}
                    p(v-if="selectedApp.description" class="text-sm text-gray-500 truncate") {{ selectedApp.description }}
                  app-functions-deploy-function-modal(:app-id="selectedAppId" @deployed="onFunctionDeployed")
                    template(#trigger)
                      ui-button(:size="Size.SM" :disabled="!selectedAppId")
                        template(#before)
                          ui-icon(icon="plus" :size="15")
                        | Deploy Function

                div(class="grid grid-cols-1 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] gap-5 items-start")
                  div(class="flex flex-col gap-3")
                    div(class="flex items-center justify-between gap-3")
                      h3(class="text-sm font-semibold text-gray-800") Deployed
                      span(class="text-xs text-gray-400 font-numeric tabular-nums") {{ functions.length }}
                    div(v-if="functionsLoading" v-loading="true" class="py-10")
                    div(v-else-if="functions.length === 0" class="py-14 text-center border border-dashed border-gray-200 rounded-xl bg-white")
                      p(class="text-sm font-medium text-gray-400") No functions deployed
                    div(v-else class="flex flex-col gap-2")
                      ui-clickable(
                        v-for="fn in functions"
                        :key="fn.id"
                        tag="button"
                        class="bg-white border rounded-xl p-4 text-left transition-all hover:border-blue-300"
                        :class="selectedFunctionId === fn.id ? 'border-blue-300 shadow-xs' : 'border-gray-200'"
                        @click="selectFunction(fn)"
                      )
                        div(class="flex items-start justify-between gap-3")
                          div(class="min-w-0 flex flex-col gap-1.5")
                            span(class="text-sm font-semibold text-gray-900 truncate") {{ fn.name }}
                            span(class="text-xs text-gray-500 truncate font-mono") {{ fn.entrypoint }}
                            div(class="flex items-center gap-2")
                              ui-badge(:variant="functionStatusVariant(fn.status)" :dot="true") {{ statusLabel(fn.status) }}
                              span(class="text-xs text-gray-400") {{ shortId(fn.id) }}
                          ui-icon(icon="chevron-right" :size="16" class="text-gray-300 shrink-0")

                  div(class="min-w-0 flex flex-col gap-5")
                    div(v-if="!selectedFunction" class="py-16 text-center border border-dashed border-gray-200 rounded-xl bg-white")
                      p(class="text-sm font-medium text-gray-400") Select a function
                    template(v-else)
                      div(class="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4")
                        div(class="flex flex-wrap items-start justify-between gap-3")
                          div(class="min-w-0 flex flex-col gap-1.5")
                            div(class="flex items-center gap-2")
                              h3(class="text-base font-semibold text-gray-900 truncate") {{ selectedFunction.name }}
                              ui-badge(:variant="functionStatusVariant(selectedFunction.status)" :dot="true") {{ statusLabel(selectedFunction.status) }}
                            div(class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500")
                              span(class="font-mono truncate") {{ selectedFunction.entrypoint }}
                              span(v-if="selectedFunction.activeRevisionId") rev {{ shortId(selectedFunction.activeRevisionId) }}
                              span Created {{ formatDate(selectedFunction.createdAt) }}
                          app-functions-invoke-function-modal(:function-id="selectedFunctionId" @invoked="onInvocationCreated")
                            template(#trigger)
                              ui-button(:size="Size.SM" :variant="Variant.Blue" :disabled="!selectedFunctionId")
                                template(#before)
                                  ui-icon(icon="play-circle" :size="15")
                                | Invoke

                        div(class="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-4")
                          div(class="min-w-0 flex flex-col gap-1")
                            span(class="text-xs text-gray-400") Runtime
                            span(class="text-sm font-semibold text-gray-900") {{ activeRevision?.runtime?.pythonVersion || 'python' }}
                            span(class="text-xs text-gray-500") {{ activeRevision?.runtime?.cpu || 'cpu' }} / {{ activeRevision?.runtime?.memoryMb || 0 }} MB
                          div(class="min-w-0 flex flex-col gap-1")
                            span(class="text-xs text-gray-400") Scale
                            span(class="text-sm font-semibold text-gray-900") {{ activeRevision?.autoscaling?.minContainers ?? 0 }} → {{ activeRevision?.autoscaling?.maxContainers ?? 0 }}
                            span(class="text-xs text-gray-500") zero after {{ activeRevision?.autoscaling?.scaleDownAfterSecs ?? 0 }}s
                          div(class="min-w-0 flex flex-col gap-1")
                            span(class="text-xs text-gray-400") Security
                            span(class="text-sm font-semibold text-gray-900") {{ activeRevision?.security?.sandbox || 'container' }}
                            span(class="text-xs text-gray-500") {{ activeRevision?.security?.networkPolicy || 'deny_all' }}

                      div(class="grid grid-cols-1 2xl:grid-cols-2 gap-5")
                        div(class="flex flex-col gap-3")
                          div(class="flex items-center justify-between gap-3")
                            h3(class="text-sm font-semibold text-gray-800") Revisions
                            span(class="text-xs text-gray-400 font-numeric tabular-nums") {{ revisions.length }}
                          div(v-if="detailLoading" v-loading="true" class="py-8")
                          div(v-else-if="revisions.length === 0" class="py-10 text-center border border-dashed border-gray-200 rounded-xl bg-white")
                            p(class="text-sm font-medium text-gray-400") No revisions
                          div(v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden")
                            div(
                              v-for="revision in revisions"
                              :key="revision.id"
                              class="px-4 py-3 border-b border-gray-100 last:border-b-0 flex items-start justify-between gap-3"
                            )
                              div(class="min-w-0 flex flex-col gap-1")
                                span(class="text-sm font-semibold text-gray-900") v{{ revision.version || 1 }}
                                span(class="text-xs text-gray-500 truncate") {{ revision.image?.base }}
                                span(class="text-xs text-gray-400") {{ formatDate(revision.createdAt) }}
                              ui-badge(v-if="revision.buildId" :variant="Variant.Gray") {{ shortId(revision.buildId) }}

                        div(class="flex flex-col gap-3")
                          div(class="flex items-center justify-between gap-3")
                            h3(class="text-sm font-semibold text-gray-800") Invocations
                            span(class="text-xs text-gray-400 font-numeric tabular-nums") {{ invocations.length }}
                          div(v-if="detailLoading" v-loading="true" class="py-8")
                          div(v-else-if="invocations.length === 0" class="py-10 text-center border border-dashed border-gray-200 rounded-xl bg-white")
                            p(class="text-sm font-medium text-gray-400") No invocations
                          div(v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden")
                            ui-clickable(
                              v-for="invocation in invocations"
                              :key="invocation.id"
                              tag="button"
                              class="w-full px-4 py-3 border-b border-gray-100 last:border-b-0 text-left hover:bg-gray-50 transition-colors"
                              @click="openInvocation(invocation)"
                            )
                              div(class="flex items-start justify-between gap-3")
                                div(class="min-w-0 flex flex-col gap-1")
                                  div(class="flex items-center gap-2")
                                    ui-badge(:variant="invocationStatusVariant(invocation.status)" :dot="true") {{ statusLabel(invocation.status) }}
                                    span(class="text-xs text-gray-400 font-mono") {{ shortId(invocation.id) }}
                                  span(class="text-xs text-gray-500") attempt {{ invocation.attempt || 0 }} / {{ invocation.maxAttempts || 1 }}
                                  span(v-if="invocation.error" class="text-xs text-red-500 truncate") {{ invocation.error }}
                                span(class="text-xs text-gray-400 shrink-0") {{ formatDate(invocation.createdAt) }}

        template(v-else)
          div(class="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-5 items-start")
            div(class="flex flex-col gap-3")
              div(class="flex items-center justify-between gap-3")
                h2(class="text-sm font-semibold text-gray-800") Runner Pools
                span(class="text-xs text-gray-400 font-numeric tabular-nums") {{ runnerPools.length }}
              div(v-if="lastRunnerPool?.bootstrapToken" class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-2")
                span(class="text-sm font-semibold text-amber-900") Bootstrap token
                pre(class="text-xs text-amber-900 whitespace-pre-wrap break-all font-mono") {{ lastRunnerPool.bootstrapToken }}
              div(v-if="poolsLoading" v-loading="true" class="py-12")
              div(v-else-if="runnerPools.length === 0" class="py-16 text-center border border-dashed border-gray-200 rounded-xl bg-white")
                p(class="text-sm font-medium text-gray-400") No runner pools
              div(v-else class="flex flex-col gap-2")
                ui-clickable(
                  v-for="pool in runnerPools"
                  :key="pool.id"
                  tag="button"
                  class="bg-white border rounded-xl p-4 text-left transition-all hover:border-blue-300"
                  :class="selectedPoolId === pool.id ? 'border-blue-300 shadow-xs' : 'border-gray-200'"
                  @click="selectRunnerPool(pool)"
                )
                  div(class="flex items-start justify-between gap-3")
                    div(class="min-w-0 flex flex-col gap-1.5")
                      span(class="text-sm font-semibold text-gray-900 truncate") {{ pool.name }}
                      span(class="text-xs text-gray-500") {{ pool.provider }} {{ pool.region }}
                      ui-badge(:variant="runnerPoolStatusVariant(pool.status)" :dot="true") {{ statusLabel(pool.status) }}
                    ui-icon(icon="chevron-right" :size="16" class="text-gray-300 shrink-0")

            div(class="min-w-0 flex flex-col gap-3")
              div(class="flex items-center justify-between gap-3")
                h2(class="text-sm font-semibold text-gray-800") Agents
                span(class="text-xs text-gray-400 font-numeric tabular-nums") {{ runnerAgents.length }}
              div(v-if="!selectedPoolId" class="py-20 text-center border border-dashed border-gray-200 rounded-xl bg-white")
                p(class="text-sm font-medium text-gray-400") Select a runner pool
              div(v-else-if="agentsLoading" v-loading="true" class="py-12")
              div(v-else-if="runnerAgents.length === 0" class="py-16 text-center border border-dashed border-gray-200 rounded-xl bg-white")
                p(class="text-sm font-medium text-gray-400") No agents registered
              div(v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden")
                div(v-for="agent in runnerAgents" :key="agent.id" class="px-4 py-3 border-b border-gray-100 last:border-b-0 flex items-start justify-between gap-3")
                  div(class="min-w-0 flex flex-col gap-1")
                    div(class="flex items-center gap-2")
                      span(class="text-sm font-semibold text-gray-900 truncate") {{ agent.hostname || shortId(agent.id) }}
                      ui-badge(:variant="runnerAgentStatusVariant(agent.status)" :dot="true") {{ statusLabel(agent.status) }}
                    span(class="text-xs text-gray-500") heartbeat {{ formatDate(agent.lastHeartbeatAt) || 'never' }}
                    pre(
                      v-if="agent.capabilities"
                      class="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded p-2 mt-1 whitespace-pre-wrap overflow-auto max-h-28"
                    ) {{ formatJson(agent.capabilities) }}
                  span(class="text-xs text-gray-400 shrink-0 font-mono") {{ shortId(agent.id) }}

    app-functions-invocation-detail-drawer(v-model="invocationDrawerOpen" :invocation="selectedInvocation")
</template>

<script lang="ts">
import type { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Size, Variant } from '@/features/ui/clickables/model'
import { AsyncData } from '@/util/async-data.decorator'
import { formatDate as formatShortDate } from '@/util/format'
import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'
import type {
  FunctionDetail,
  FunctionInvocation,
  FunctionItem,
  FunctionRevision,
  FunctionsApp,
  FunctionsControlPlaneApi,
  RunnerAgent,
  RunnerPool,
} from '../../api'
import { itemsFromPage } from '../../api'
import { formatJson, functionStatusVariant, invocationStatusVariant, runnerAgentStatusVariant, runnerPoolStatusVariant, statusLabel } from '../../model'

@Component
export default class AppView extends Mixins(ApiClientsMixin, LoadingMixin) {
  public activeTab: 'functions' | 'runners' = 'functions'
  public apps: FunctionsApp[] = []
  public functions: FunctionItem[] = []
  public revisions: FunctionRevision[] = []
  public invocations: FunctionInvocation[] = []
  public runnerPools: RunnerPool[] = []
  public runnerAgents: RunnerAgent[] = []
  public selectedAppId = ''
  public selectedFunctionId = ''
  public selectedFunction?: FunctionDetail = undefined
  public selectedPoolId = ''
  public selectedInvocation?: FunctionInvocation = undefined
  public invocationDrawerOpen = false
  public lastRunnerPool?: RunnerPool = undefined
  public functionsLoading = false
  public detailLoading = false
  public poolsLoading = false
  public agentsLoading = false

  public readonly Size = Size
  public readonly Variant = Variant
  public readonly functionStatusVariant = functionStatusVariant
  public readonly invocationStatusVariant = invocationStatusVariant
  public readonly runnerPoolStatusVariant = runnerPoolStatusVariant
  public readonly runnerAgentStatusVariant = runnerAgentStatusVariant
  public readonly statusLabel = statusLabel
  public readonly formatJson = formatJson
  public readonly formatDate = (value: string | undefined): string =>
    formatShortDate(value, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  private get api(): FunctionsControlPlaneApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API) as unknown as FunctionsControlPlaneApi
  }

  public get selectedApp(): FunctionsApp | undefined {
    return this.apps.find((app) => app.id === this.selectedAppId)
  }

  public get selectedPool(): RunnerPool | undefined {
    return this.runnerPools.find((pool) => pool.id === this.selectedPoolId)
  }

  public get activeRevision(): FunctionRevision | undefined {
    return this.selectedFunction?.activeRevision ?? this.revisions[0]
  }

  @AsyncData()
  public async asyncData(): Promise<void> {
    this.setLoading(true)
    try {
      await Promise.all([this.loadApps(), this.loadRunnerPools()])
    } finally {
      this.setLoading(false)
    }
  }

  public async loadApps(): Promise<void> {
    const { data } = await this.api.functionsAppsGet({ page: 1, perPage: 50 })
    this.apps = itemsFromPage(data)
    if (!this.apps.some((app) => app.id === this.selectedAppId)) {
      this.selectedAppId = this.apps[0]?.id ?? ''
      this.selectedFunctionId = ''
    }
    if (this.selectedAppId) {
      await this.loadFunctionsForApp(this.selectedAppId)
    } else {
      this.functions = []
      this.selectedFunction = undefined
    }
  }

  public async selectApp(app: FunctionsApp): Promise<void> {
    if (!app.id || this.selectedAppId === app.id) return
    this.selectedAppId = app.id
    this.selectedFunctionId = ''
    await this.loadFunctionsForApp(app.id)
  }

  public async loadFunctionsForApp(appId: string): Promise<void> {
    this.functionsLoading = true
    try {
      const { data } = await this.api.functionsAppsAppIdFunctionsGet({ appId, page: 1, perPage: 50 })
      this.functions = itemsFromPage(data)
      if (!this.functions.some((fn) => fn.id === this.selectedFunctionId)) {
        this.selectedFunctionId = this.functions[0]?.id ?? ''
      }
      if (this.selectedFunctionId) {
        await this.loadFunctionDetail(this.selectedFunctionId)
      } else {
        this.selectedFunction = undefined
        this.revisions = []
        this.invocations = []
      }
    } finally {
      this.functionsLoading = false
    }
  }

  public async selectFunction(fn: FunctionItem): Promise<void> {
    if (!fn.id || this.selectedFunctionId === fn.id) return
    this.selectedFunctionId = fn.id
    await this.loadFunctionDetail(fn.id)
  }

  public async loadFunctionDetail(functionId: string): Promise<void> {
    this.detailLoading = true
    try {
      const fallback = this.functions.find((fn) => fn.id === functionId)
      try {
        const { data } = await this.api.functionsFunctionsFunctionIdGet({ functionId })
        this.selectedFunction = data
      } catch {
        this.selectedFunction = fallback as FunctionDetail | undefined
      }
      const [revisions, invocations] = await Promise.all([
        this.api.functionsFunctionsFunctionIdRevisionsGet({ functionId, page: 1, perPage: 20 }),
        this.api.functionsFunctionsFunctionIdInvocationsGet({ functionId, page: 1, perPage: 25 }),
      ])
      this.revisions = itemsFromPage(revisions.data)
      this.invocations = itemsFromPage(invocations.data)
    } finally {
      this.detailLoading = false
    }
  }

  public async loadRunnerPools(): Promise<void> {
    this.poolsLoading = true
    try {
      const { data } = await this.api.functionsRunnerPoolsGet({ page: 1, perPage: 50 })
      this.runnerPools = itemsFromPage(data)
      if (!this.runnerPools.some((pool) => pool.id === this.selectedPoolId)) {
        this.selectedPoolId = this.runnerPools[0]?.id ?? ''
      }
      if (this.selectedPoolId) await this.loadAgentsForPool(this.selectedPoolId)
      else this.runnerAgents = []
    } finally {
      this.poolsLoading = false
    }
  }

  public async selectRunnerPool(pool: RunnerPool): Promise<void> {
    if (!pool.id || this.selectedPoolId === pool.id) return
    this.selectedPoolId = pool.id
    await this.loadAgentsForPool(pool.id)
  }

  public async loadAgentsForPool(poolId: string): Promise<void> {
    this.agentsLoading = true
    try {
      const { data } = await this.api.functionsRunnerPoolsPoolIdAgentsGet({ poolId, page: 1, perPage: 50 })
      this.runnerAgents = itemsFromPage(data)
    } finally {
      this.agentsLoading = false
    }
  }

  public async onAppCreated(app: FunctionsApp): Promise<void> {
    if (app.id && !this.apps.some((existing) => existing.id === app.id)) this.apps = [app, ...this.apps]
    await this.selectApp(app)
  }

  public async onFunctionDeployed(fn: FunctionItem): Promise<void> {
    if (fn.id && !this.functions.some((existing) => existing.id === fn.id)) this.functions = [fn, ...this.functions]
    await this.selectFunction(fn)
  }

  public onInvocationCreated(invocation: FunctionInvocation): void {
    this.invocations = [invocation, ...this.invocations.filter((item) => item.id !== invocation.id)]
    this.openInvocation(invocation)
  }

  public async onRunnerPoolCreated(pool: RunnerPool): Promise<void> {
    this.lastRunnerPool = pool
    if (pool.id && !this.runnerPools.some((existing) => existing.id === pool.id)) this.runnerPools = [pool, ...this.runnerPools]
    await this.selectRunnerPool(pool)
  }

  public openInvocation(invocation: FunctionInvocation): void {
    this.selectedInvocation = invocation
    this.invocationDrawerOpen = true
  }

  public shortId(value: string | undefined): string {
    if (!value) return ''
    const parts = value.split('_')
    const tail = parts[parts.length - 1] || value
    return tail.length > 10 ? tail.slice(0, 10) : tail
  }
}
</script>
