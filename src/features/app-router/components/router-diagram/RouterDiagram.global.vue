<template lang="pug">
div(class="relative w-full h-full")
  vue-flow(
    v-if="hasContent"
    :nodes="nodes"
    :edges="edges"
    :node-types="nodeTypes"
    :default-edge-options="defaultEdgeOptions"
    :nodes-draggable="false"
    :nodes-connectable="false"
    :elements-selectable="true"
    class="bg-zinc-50 rounded-xl w-full h-full"
    @init="onFlowInit"
  )
    vue-flow-background(pattern="dots" :gap="20" :size="1" :color="'#e5e7eb'")
    vue-flow-controls(position="bottom-left" :show-fit-view="true" :show-interactive="false")
    vue-flow-minimap(position="bottom-right" :node-color="minimapNodeColor")

  div(v-else class="w-full h-full bg-zinc-50 rounded-xl flex items-center justify-center")
    div(class="flex flex-col items-center gap-4 text-center")
      div(class="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-center")
        ui-icon(icon="router" :size="22" class="text-indigo-500")
      div(class="flex flex-col gap-1")
        p(class="text-sm font-semibold text-gray-800") Build this router visually
        p(class="text-xs text-gray-400 max-w-sm") Start from the builder guide on the left. The map will show routing interceptors, pipeline features, router strategy, and final model targets as you add them.
</template>

<script lang="ts">
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

import type {
  HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse,
  HyperstrateServerInternalModulesRouterApplicationRouterInterceptorResponse,
  HyperstrateServerInternalModulesRouterApplicationRouterResponse,
  InternalModulesRouterInterfacesHttpRouterTargetResponse,
} from '@/__generated__/hyperstrate-api'
import { ArrayProp, ObjectProp } from '@/util/prop-decorators'
import { Background as VueFlowBackground } from '@vue-flow/background'
import { Controls as VueFlowControls } from '@vue-flow/controls'
import { MarkerType, VueFlow, type DefaultEdgeOptions, type Edge, type Node, type VueFlowStore } from '@vue-flow/core'
import { MiniMap as VueFlowMinimap } from '@vue-flow/minimap'
import { markRaw } from 'vue'
import { Component, Vue } from 'vue-facing-decorator'
import FeatureNodeComponent from './FeatureNode.vue'
import InterceptorNodeComponent from './InterceptorNode.vue'
import JunctionNodeComponent from './JunctionNode.vue'
import RouterNodeComponent from './RouterNode.vue'
import TargetNodeComponent from './TargetNode.vue'

const ROUTER_X = 0
const INT_START_X = 320
const INT_STEP = 230 // NODE_W + 30px gap between horizontal interceptors

const NODE_W = 200
const JUNCTION_W = 16
const ROW_H = 120
const ROUTER_H = 90
const FEAT_GAP = 36

type RouterDiagramEmits = {
  (e: string): void
}

@Component({
  components: { VueFlow, VueFlowBackground, VueFlowControls, VueFlowMinimap },
})
export default class RouterDiagram extends Vue {
  declare public $emit: RouterDiagramEmits

  @ObjectProp(true)
  public readonly router!: HyperstrateServerInternalModulesRouterApplicationRouterResponse

  @ArrayProp(() => [])
  public readonly targets!: InternalModulesRouterInterfacesHttpRouterTargetResponse[]

  @ArrayProp(() => [])
  public readonly features!: HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse[]

  @ArrayProp(() => [])
  public readonly interceptors!: HyperstrateServerInternalModulesRouterApplicationRouterInterceptorResponse[]

  @ObjectProp(() => ({}))
  public readonly modelDefinitionKeyMap!: Record<string, string>

  @ObjectProp(() => ({}))
  public readonly modelDisplayNameMap!: Record<string, string>

  @ObjectProp(() => ({}))
  public readonly modelProviderMap!: Record<string, string>

  public readonly nodeTypes = {
    routerNode: markRaw(RouterNodeComponent),
    targetNode: markRaw(TargetNodeComponent),
    featureNode: markRaw(FeatureNodeComponent),
    interceptorNode: markRaw(InterceptorNodeComponent),
    junctionNode: markRaw(JunctionNodeComponent),
  }

  public readonly defaultEdgeOptions: DefaultEdgeOptions = {
    animated: false,
    style: { strokeWidth: 1.5, stroke: '#d1d5db' },
    markerEnd: MarkerType.ArrowClosed,
  }

  public get hasContent(): boolean {
    return this.targets.length > 0 || this.features.length > 0 || this.interceptors.length > 0
  }

  public get nodes(): Node[] {
    const sortedFeatures = [...this.features].sort((a, b) => (a.executionOrder ?? 0) - (b.executionOrder ?? 0))
    const sortedInterceptors = [...this.interceptors].sort((a, b) => a.executionOrder - b.executionOrder)
    const ic = sortedInterceptors.length
    const tc = this.targets.length
    const hasInterceptors = ic > 0

    const routerY = 0
    const flowCenter = routerY + ROUTER_H / 2

    const result: Node[] = []

    // Router
    result.push({
      id: 'router',
      type: 'routerNode',
      position: { x: ROUTER_X, y: routerY },
      data: {
        router: this.router,
      },
      style: { width: `${NODE_W}px` },
    })

    // Features — stacked below router, same X
    sortedFeatures.forEach((feature, i) => {
      result.push({
        id: `feature-${feature.id}`,
        type: 'featureNode',
        position: { x: ROUTER_X, y: routerY + ROUTER_H + FEAT_GAP + i * ROW_H },
        data: {
          feature,
          modelDisplayNameMap: this.modelDisplayNameMap,
        },
        style: { width: `${NODE_W}px` },
      })
    })

    // Interceptors — horizontal chain sorted by executionOrder
    if (hasInterceptors) {
      sortedInterceptors.forEach((interceptor, i) => {
        result.push({
          id: `interceptor-${interceptor.id}`,
          type: 'interceptorNode',
          position: { x: INT_START_X + i * INT_STEP, y: routerY },
          data: {
            interceptor,
            modelDisplayNameMap: this.modelDisplayNameMap,
          },
          style: { width: `${NODE_W}px` },
        })
      })

      // Junction dot after the last interceptor
      const junctionX = INT_START_X + ic * INT_STEP + 20
      result.push({
        id: 'junction',
        type: 'junctionNode',
        position: { x: junctionX, y: flowCenter - JUNCTION_W / 2 },
        data: {},
        style: { width: `${JUNCTION_W}px`, height: `${JUNCTION_W}px` },
      })
    }

    // Targets — rightmost column, centered on flow axis
    const targetX = hasInterceptors ? INT_START_X + ic * INT_STEP + 20 + JUNCTION_W + 20 : INT_START_X
    const tcBlockH = tc * ROW_H
    const tcTop = flowCenter - tcBlockH / 2
    this.targets.forEach((target, i) => {
      result.push({
        id: `target-${target.id}`,
        type: 'targetNode',
        position: { x: targetX, y: tcTop + i * ROW_H },
        data: {
          target,
          strategy: this.router.strategy,
          modelDefinitionKey: this.modelDefinitionKeyMap[target.modelId ?? ''] ?? '',
          modelDisplayName: this.modelDisplayNameMap[target.modelId ?? ''] ?? '',
          provider: this.modelProviderMap[target.modelId ?? ''] ?? '',
        },
        style: { width: `${NODE_W}px` },
      })
    })

    return result
  }

  public get edges(): Edge[] {
    const sortedInterceptors = [...this.interceptors].sort((a, b) => a.executionOrder - b.executionOrder)
    const result: Edge[] = []
    const hasInterceptors = sortedInterceptors.length > 0

    // Features to router (upward)
    this.features.forEach((feature) => {
      result.push({
        id: `edge-feat-${feature.id}`,
        source: `feature-${feature.id}`,
        sourceHandle: 'feat-top',
        target: 'router',
        targetHandle: 'features-bottom',
        style: { stroke: feature.isEnabled ? '#c4b5fd' : '#e5e7eb', strokeDasharray: feature.isEnabled ? undefined : '4' },
        animated: feature.isEnabled,
      })
    })

    if (hasInterceptors) {
      // Router to first interceptor
      const first = sortedInterceptors[0]
      result.push({
        id: `edge-router-int-${first.id}`,
        source: 'router',
        sourceHandle: 'right-out',
        target: `interceptor-${first.id}`,
        style: { stroke: first.isEnabled ? '#a5b4fc' : '#e5e7eb', strokeDasharray: first.isEnabled ? undefined : '4' },
        animated: first.isEnabled,
      })

      // Chain: interceptor[i] to interceptor[i+1]
      for (let i = 0; i < sortedInterceptors.length - 1; i++) {
        const cur = sortedInterceptors[i]
        const next = sortedInterceptors[i + 1]
        result.push({
          id: `edge-int-int-${cur.id}-${next.id}`,
          source: `interceptor-${cur.id}`,
          sourceHandle: 'int-out',
          target: `interceptor-${next.id}`,
          style: { stroke: next.isEnabled ? '#a5b4fc' : '#e5e7eb', strokeDasharray: next.isEnabled ? undefined : '4' },
          animated: next.isEnabled,
        })
      }

      // Last interceptor to junction
      const last = sortedInterceptors[sortedInterceptors.length - 1]
      result.push({
        id: `edge-int-junc-${last.id}`,
        source: `interceptor-${last.id}`,
        sourceHandle: 'int-out',
        target: 'junction',
        style: { stroke: last.isEnabled ? '#a5b4fc' : '#e5e7eb', strokeDasharray: last.isEnabled ? undefined : '4' },
        animated: last.isEnabled,
        markerEnd: undefined,
      })

      // Junction to each target (one-to-many)
      this.targets.forEach((target) => {
        result.push({
          id: `edge-junc-tgt-${target.id}`,
          source: 'junction',
          sourceHandle: 'junction-out',
          target: `target-${target.id}`,
          style: { stroke: target.isEnabled ? '#86efac' : '#e5e7eb', strokeDasharray: target.isEnabled ? undefined : '4' },
          animated: target.isEnabled,
        })
      })
    } else {
      // No interceptors: router to each target directly
      this.targets.forEach((target) => {
        result.push({
          id: `edge-tgt-${target.id}`,
          source: 'router',
          sourceHandle: 'right-out',
          target: `target-${target.id}`,
          style: { stroke: target.isEnabled ? '#86efac' : '#e5e7eb', strokeDasharray: target.isEnabled ? undefined : '4' },
          animated: target.isEnabled,
        })
      })
    }

    return result
  }

  public onFlowInit(store: VueFlowStore): void {
    void store.fitView({ padding: 0.5 })
  }

  public minimapNodeColor(node: Node): string {
    if (node.type === 'routerNode') return '#93c5fd'
    if (node.type === 'targetNode') return '#86efac'
    if (node.type === 'featureNode') return '#c4b5fd'
    if (node.type === 'interceptorNode') return '#a5b4fc'
    return '#d1d5db'
  }
}
</script>
