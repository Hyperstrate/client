<template lang="pug">
div(ref="container" class="relative w-full select-none font-sans")
  svg(ref="svgEl" :width="width" :height="height")
  div(
    v-show="tooltip.visible"
    class="pointer-events-none absolute z-10 whitespace-nowrap rounded-xl bg-gray-900 px-3 py-2 text-xs shadow-2xl flex flex-col gap-0.5"
    :style="tooltipStyle"
  )
    div(class="text-xs font-semibold uppercase tracking-wider text-gray-500") {{ tooltip.label }}
    div(class="font-numeric font-semibold tabular-nums text-white") {{ tooltip.value }}
    span(class="absolute left-1/2 -translate-x-1/2 -bottom-[5px] block h-2.5 w-2.5 rotate-45 bg-gray-900")
</template>

<script lang="ts">
import * as d3 from 'd3'
import { Component, Ref, Vue, Watch } from 'vue-facing-decorator'
import { formatDate } from '@/util/format'
import { ArrayProp, BooleanProp, NumberProp, OptionalProp, StringProp } from '@/util/prop-decorators'

export interface LineChartPoint {
  bucket: string
  value: number
}

@Component
export default class LineChart extends Vue {
  @ArrayProp(() => [])
  public readonly data!: LineChartPoint[]

  @NumberProp(220)
  public readonly height!: number

  @NumberProp(650, 0)
  public readonly animationDurationMs!: number

  @StringProp('#6366f1')
  public readonly color!: string

  @OptionalProp((v: number) => String(Math.round(v)))
  public readonly formatY!: (v: number) => string

  @BooleanProp()
  public readonly sparkline!: boolean

  @Ref
  private readonly container!: HTMLDivElement

  @Ref
  private readonly svgEl!: SVGSVGElement

  public width = 600
  private ro?: ResizeObserver = undefined
  private readonly uid = Math.random().toString(36).slice(2, 8)
  private readonly MARGIN = { top: 20, right: 16, bottom: 36, left: 52 }
  private readonly MARGIN_SPARKLINE = { top: 6, right: 6, bottom: 6, left: 6 }

  public tooltip = { visible: false, x: 0, y: 0, label: '', value: '' }

  public get tooltipStyle(): Record<string, string> {
    return {
      left: `${this.tooltip.x}px`,
      top: `${this.tooltip.y}px`,
      transform: 'translate(-50%, calc(-100% - 10px))',
    }
  }

  mounted(): void {
    this.ro = new ResizeObserver((entries) => {
      this.width = entries[0].contentRect.width
      this.draw()
    })
    this.ro.observe(this.container)
    this.width = this.container.getBoundingClientRect().width || 600
    this.draw()
  }

  beforeUnmount(): void {
    this.ro?.disconnect()
  }

  private formatBucket(bucket: string): string {
    const s = bucket.trim()
    const d = new Date(s.includes('T') ? s : s + 'T00:00:00')
    if (isNaN(d.getTime())) return s
    if (s.length <= 7) return formatDate(d, { month: 'short', year: '2-digit' })
    if (!s.includes('T')) return formatDate(d, { month: 'short', day: 'numeric' })
    return formatDate(d, { month: 'short', day: 'numeric' }) + ' · ' + formatDate(d, { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  @Watch('data', { deep: true })
  @Watch('width')
  public draw(): void {
    if (!this.svgEl || !this.data.length) return

    const { top, right, bottom, left } = this.sparkline ? this.MARGIN_SPARKLINE : this.MARGIN
    const innerW = this.width - left - right
    const innerH = this.height - top - bottom
    const gradId = `lc-${this.uid}`
    const clipId = `lc-clip-${this.uid}`

    const svg = d3.select(this.svgEl)
    svg.selectAll('*').remove()
    const chartTransition = d3.transition().duration(this.animationDurationMs).ease(d3.easeCubicOut)

    // Area gradient
    const defs = svg.append('defs')
    const grad = defs.append('linearGradient').attr('id', gradId).attr('x1', '0').attr('y1', '0').attr('x2', '0').attr('y2', '1')
    grad.append('stop').attr('offset', '0%').attr('stop-color', this.color).attr('stop-opacity', 0.18)
    grad.append('stop').attr('offset', '85%').attr('stop-color', this.color).attr('stop-opacity', 0)
    const clip = defs.append('clipPath').attr('id', clipId)
    clip
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', innerH)
      .attr('width', this.animationDurationMs > 0 ? 0 : innerW)
    clip.select('rect').transition(chartTransition).attr('width', innerW)

    const root = svg.append('g').attr('transform', `translate(${left},${top})`)

    const x = d3
      .scalePoint<string>()
      .domain(this.data.map((d) => d.bucket))
      .range([0, innerW])
      .padding(0.5)

    const yMax = d3.max(this.data, (d) => d.value) ?? 0
    const y = d3
      .scaleLinear()
      .domain([0, yMax * 1.15 || 1])
      .range([innerH, 0])
      .nice()

    // Horizontal grid lines (full chart only)
    if (!this.sparkline)
      root
        .append('g')
        .attr('opacity', 0)
        .call(
          d3
            .axisLeft(y)
            .ticks(4)
            .tickSize(-innerW)
            .tickFormat(() => ''),
        )
        .call((g) => g.select('.domain').remove())
        .call((g) => g.selectAll('line').attr('stroke', '#f1f5f9').attr('stroke-width', 1))
        .transition(chartTransition)
        .attr('opacity', 1)

    // Area fill
    root
      .append('path')
      .datum(this.data)
      .attr('fill', `url(#${gradId})`)
      .attr('clip-path', `url(#${clipId})`)
      .attr('opacity', 0)
      .attr(
        'd',
        d3
          .area<LineChartPoint>()
          .x((d) => x(d.bucket) ?? 0)
          .y0(innerH)
          .y1((d) => y(d.value))
          .curve(d3.curveMonotoneX),
      )
      .transition(chartTransition)
      .attr('opacity', 1)

    // Line stroke
    const linePath = root
      .append('path')
      .datum(this.data)
      .attr('fill', 'none')
      .attr('stroke', this.color)
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr(
        'd',
        d3
          .line<LineChartPoint>()
          .x((d) => x(d.bucket) ?? 0)
          .y((d) => y(d.value))
          .curve(d3.curveMonotoneX),
      )

    const lineNode = linePath.node()
    if (lineNode && this.animationDurationMs > 0) {
      const length = lineNode.getTotalLength()
      linePath.attr('stroke-dasharray', `${length} ${length}`).attr('stroke-dashoffset', length).transition(chartTransition).attr('stroke-dashoffset', 0)
    }

    // Hover indicator group (crosshair line + dot)
    const hoverG = root.append('g').style('display', 'none').attr('pointer-events', 'none')

    hoverG
      .append('line')
      .attr('class', 'hv-line')
      .attr('y1', 0)
      .attr('y2', innerH)
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')

    hoverG.append('circle').attr('class', 'hv-dot').attr('r', 5).attr('fill', 'white').attr('stroke', this.color).attr('stroke-width', 2.5)

    if (!this.sparkline) {
      // X axis
      const step = Math.max(1, Math.ceil(this.data.length / 7))
      root
        .append('g')
        .attr('transform', `translate(0,${innerH})`)
        .attr('opacity', 0)
        .call(
          d3
            .axisBottom(x)
            .tickValues(this.data.filter((_, i) => i % step === 0).map((d) => d.bucket))
            .tickSizeInner(4)
            .tickSizeOuter(0)
            .tickFormat((v) => this.formatBucket(String(v))),
        )
        .call((g) => g.select('.domain').attr('stroke', '#e2e8f0'))
        .call((g) => g.selectAll('line').attr('stroke', '#e2e8f0'))
        .call((g) => g.selectAll('text').attr('font-size', 11).attr('fill', '#94a3b8').attr('dy', '1.2em'))
        .transition(chartTransition)
        .attr('opacity', 1)

      // Y axis
      root
        .append('g')
        .attr('opacity', 0)
        .call(
          d3
            .axisLeft(y)
            .ticks(4)
            .tickFormat(this.formatY as (v: d3.NumberValue) => string),
        )
        .call((g) => g.select('.domain').remove())
        .call((g) => g.selectAll('text').attr('font-size', 11).attr('fill', '#94a3b8'))
        .call((g) => g.selectAll('line').remove())
        .transition(chartTransition)
        .attr('opacity', 1)
    }

    // Transparent overlay for mouse events
    const xPositions = this.data.map((d) => ({ xv: x(d.bucket) ?? 0, d }))

    root
      .append('rect')
      .attr('width', innerW)
      .attr('height', innerH)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mousemove', (event: MouseEvent) => {
        const [mx] = d3.pointer(event)
        const nearest = xPositions.reduce((best, p) => (Math.abs(p.xv - mx) < Math.abs(best.xv - mx) ? p : best))
        const cx = nearest.xv
        const cy = y(nearest.d.value)

        hoverG.style('display', null)
        hoverG.select('.hv-line').attr('x1', cx).attr('x2', cx)
        hoverG.select('.hv-dot').attr('cx', cx).attr('cy', cy)

        this.tooltip = {
          visible: true,
          x: cx + left,
          y: cy + top,
          label: this.formatBucket(nearest.d.bucket),
          value: this.formatY(nearest.d.value),
        }
      })
      .on('mouseleave', () => {
        hoverG.style('display', 'none')
        this.tooltip = { ...this.tooltip, visible: false }
      })
  }
}
</script>
