<template lang="pug">
div(ref="container" class="relative w-full select-none")
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
import { ArrayProp, NumberProp, OptionalProp, StringProp } from '@/util/prop-decorators'

export interface BarChartItem {
  label: string
  value: number
}

@Component
export default class BarChart extends Vue {
  @ArrayProp(() => [])
  public readonly data!: BarChartItem[]

  @NumberProp(220)
  public readonly height!: number

  @NumberProp(520, 0)
  public readonly animationDurationMs!: number

  @StringProp('#6366f1')
  public readonly color!: string

  @OptionalProp((v: number) => String(Math.round(v)))
  public readonly formatY!: (v: number) => string

  @Ref('container')
  private readonly container!: HTMLDivElement

  @Ref('svgEl')
  private readonly svgEl!: SVGSVGElement

  public width = 600
  private ro?: ResizeObserver = undefined
  private readonly MARGIN = { top: 20, right: 16, bottom: 68, left: 52 }

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

  @Watch('data', { deep: true })
  @Watch('width')
  public draw(): void {
    if (!this.svgEl || !this.data.length) return

    const { top, right, bottom, left } = this.MARGIN
    const innerW = this.width - left - right
    const innerH = this.height - top - bottom

    const svg = d3.select(this.svgEl)
    svg.selectAll('*').remove()

    const root = svg.append('g').attr('transform', `translate(${left},${top})`)
    const chartTransition = d3.transition().duration(this.animationDurationMs).ease(d3.easeCubicOut)

    const x = d3
      .scaleBand()
      .domain(this.data.map((d) => d.label))
      .range([0, innerW])
      .padding(0.35)

    const yMax = d3.max(this.data, (d) => d.value) ?? 0
    const y = d3
      .scaleLinear()
      .domain([0, yMax * 1.15 || 1])
      .range([innerH, 0])
      .nice()

    // Horizontal grid lines
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

    // Bars
    root
      .selectAll<SVGRectElement, BarChartItem>('rect.bar')
      .data(this.data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.label) ?? 0)
      .attr('y', innerH)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('rx', 5)
      .attr('fill', this.color)
      .attr('fill-opacity', 0.72)
      .on('mouseenter', (event: MouseEvent, d: BarChartItem) => {
        d3.select(event.currentTarget as SVGRectElement).attr('fill-opacity', 1)
        this.tooltip = {
          visible: true,
          x: (x(d.label) ?? 0) + x.bandwidth() / 2 + left,
          y: y(d.value) + top,
          label: d.label,
          value: this.formatY(d.value),
        }
      })
      .on('mouseleave', (event: MouseEvent) => {
        d3.select(event.currentTarget as SVGRectElement).attr('fill-opacity', 0.72)
        this.tooltip = { ...this.tooltip, visible: false }
      })
      .transition()
      .delay((_, i) => (this.animationDurationMs > 0 ? i * 28 : 0))
      .duration(this.animationDurationMs)
      .ease(d3.easeCubicOut)
      .attr('y', (d) => y(d.value))
      .attr('height', (d) => Math.max(0, innerH - y(d.value)))

    // X axis
    const maxTicks = Math.max(1, Math.floor(innerW / 64))
    const step = Math.max(1, Math.ceil(this.data.length / maxTicks))
    root
      .append('g')
      .attr('transform', `translate(0,${innerH})`)
      .attr('opacity', 0)
      .call(
        d3
          .axisBottom(x)
          .tickValues(this.data.filter((_, i) => i % step === 0).map((d) => d.label))
          .tickSizeInner(4)
          .tickSizeOuter(0),
      )
      .call((g) => g.select('.domain').attr('stroke', '#e2e8f0'))
      .call((g) => g.selectAll('line').attr('stroke', '#e2e8f0'))
      .call((g) =>
        g
          .selectAll<SVGTextElement, string>('text')
          .attr('font-size', 11)
          .attr('fill', '#94a3b8')
          .attr('text-anchor', 'end')
          .attr('transform', 'rotate(-40) translate(-4,0)')
          .text((d) => (d.length > 16 ? d.slice(0, 14) + '…' : d)),
      )
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
}
</script>
