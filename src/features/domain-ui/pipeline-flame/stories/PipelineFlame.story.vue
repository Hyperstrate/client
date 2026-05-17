<!-- eslint-disable @typescript-eslint/explicit-function-return-type -->
<template lang="pug">
story(title="PipelineFlame")
  variant(title="Typical router pipeline")
    div(class="p-4 max-w-2xl")
      domain-ui-pipeline-flame(:item="typicalLog")
  variant(title="Tiny A/B before inference")
    div(class="p-4 max-w-2xl")
      domain-ui-pipeline-flame(:item="tinyABLog")
  variant(title="Cache hit")
    div(class="p-4 max-w-2xl")
      domain-ui-pipeline-flame(:item="cacheHitLog")
  variant(title="Error")
    div(class="p-4 max-w-2xl")
      domain-ui-pipeline-flame(:item="errorLog")
  variant(title="Blocked content filter")
    div(class="p-4 max-w-2xl")
      domain-ui-pipeline-flame(:item="blockedContentFilterLog")
  variant(title="Empty steps")
    div(class="p-4 max-w-2xl")
      domain-ui-pipeline-flame(:item="emptyLog")
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component, Vue } from 'vue-facing-decorator'

function makeLog(steps: unknown[], latencyMs = 500) {
  return {
    id: '1',
    latencyMs,
    pipelineSteps: steps,
    createdAt: new Date().toISOString(),
  } as never
}

@Component
export default class PipelineFlameStory extends Vue {
  private typicalLog = makeLog(
    [
      { phase: 1, kind: 'rate_limit', name: 'Rate Limit', outcome: 'passed', durationMs: 5, offsetMs: 0 },
      { phase: 2, kind: 'cache', name: 'Cache', outcome: 'miss', durationMs: 8, offsetMs: 5 },
      { phase: 3, kind: 'target_selection', name: 'Target Select', outcome: 'selected', durationMs: 2, offsetMs: 13 },
      { phase: 4, kind: 'inference', name: 'Inference', outcome: 'streaming', durationMs: 460, offsetMs: 15 },
      { phase: 5, kind: 'cache_store', name: 'Cache Store', outcome: 'stored', durationMs: 12, offsetMs: 475 },
    ],
    500,
  )

  private tinyABLog = makeLog(
    [
      { phase: 1, kind: 'rate_limit', name: 'Rate Limit', outcome: 'passed', durationMs: 0.04, offsetMs: 0 },
      { phase: 2, kind: 'budget', name: 'Budget Check', outcome: 'passed', durationMs: 0.08, offsetMs: 0.04 },
      { phase: 5, kind: 'interceptor', name: 'A/B Test', outcome: 'routed', durationMs: 0.004, offsetMs: 0.12 },
      { phase: 6, kind: 'inference', name: 'Model Inference', outcome: 'success', durationMs: 224, offsetMs: 0.124 },
    ],
    225,
  )

  private cacheHitLog = makeLog(
    [
      { phase: 1, kind: 'rate_limit', name: 'Rate Limit', outcome: 'passed', durationMs: 3, offsetMs: 0 },
      { phase: 2, kind: 'cache', name: 'Cache', outcome: 'hit_exact', durationMs: 6, offsetMs: 3 },
    ],
    10,
  )

  private errorLog = makeLog(
    [
      { phase: 1, kind: 'rate_limit', name: 'Rate Limit', outcome: 'passed', durationMs: 2, offsetMs: 0 },
      { phase: 2, kind: 'inference', name: 'Inference', outcome: 'error', durationMs: 150, offsetMs: 2 },
    ],
    155,
  )

  private blockedContentFilterLog = makeLog(
    [
      { phase: 1, kind: 'rate_limit', name: 'Rate Limit', outcome: 'passed', durationMs: 0.2, offsetMs: 0 },
      { phase: 2, kind: 'budget', name: 'Budget Check', outcome: 'passed', durationMs: 0.3, offsetMs: 0.2 },
      { phase: 5, kind: 'interceptor', name: 'A/B Test', outcome: 'passed', durationMs: 0.5, offsetMs: 0.5 },
      { phase: 5, kind: 'interceptor', name: 'Content Filter', outcome: 'blocked', detail: 'matched blocked pattern', durationMs: 0.4, offsetMs: 1 },
    ],
    2,
  )

  private emptyLog = makeLog([], 0)
}
</script>
