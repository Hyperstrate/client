import { computed, reactive, type ComputedRef } from 'vue'

export type AnimatedIndicatorStrategy = 'width' | 'edges'

export interface AnimatedIndicatorClasses {
  on: boolean
  left: boolean
  right: boolean
}

export interface AnimatedIndicatorOptions {
  strategy: AnimatedIndicatorStrategy
  scrollPadding?: number
  onError?: (error: unknown) => void
}

export interface AnimatedIndicator {
  classes: AnimatedIndicatorClasses
  style: ComputedRef<Record<string, string>>
  update: (container?: HTMLElement, active?: Element) => void
  hide: () => void
  observe: (container?: HTMLElement, onResize?: () => void) => void
  disconnect: () => void
}

interface AnimatedIndicatorPosition {
  left: number
  right: number
  width: number
}

export function useAnimatedIndicator(options: AnimatedIndicatorOptions): AnimatedIndicator {
  const classes = reactive<AnimatedIndicatorClasses>({
    on: false,
    left: false,
    right: false,
  })

  const position = reactive<AnimatedIndicatorPosition>({
    left: 0,
    right: 0,
    width: 0,
  })

  let resizeObserver: ResizeObserver | undefined

  const style = computed<Record<string, string>>(() => {
    if (options.strategy === 'edges') {
      const edgeStyle: Record<string, string> = { left: `${position.left}px`, right: `${position.right}px` }
      return edgeStyle
    }

    const widthStyle: Record<string, string> = { left: `${position.left}px`, width: `${position.width}px` }
    return widthStyle
  })

  const hide = (): void => {
    Object.assign(classes, {
      on: false,
      left: false,
      right: false,
    })
  }

  const updateDirection = (previousLeft: number): void => {
    classes.left = previousLeft > position.left
    classes.right = previousLeft < position.left
  }

  const show = (previousLeft: number): void => {
    if (!classes.on) {
      classes.on = true
      classes.left = false
      classes.right = false
      return
    }

    updateDirection(previousLeft)
  }

  const updateWidthPosition = (container: HTMLElement, active: Element): void => {
    const previousLeft = position.left
    const containerRect = container.getBoundingClientRect()
    const activeRect = active.getBoundingClientRect()

    position.left = activeRect.left - containerRect.left
    position.width = activeRect.width
    show(previousLeft)
  }

  const updateEdgesPosition = (container: HTMLElement, active: Element): void => {
    const padding = options.scrollPadding ?? 0
    const previousLeft = position.left
    const containerRect = container.getBoundingClientRect()
    const rectBeforeScroll = active.getBoundingClientRect()
    const contentLeft = container.scrollLeft + (rectBeforeScroll.left - containerRect.left)
    const contentRight = container.scrollLeft + (rectBeforeScroll.right - containerRect.left)

    const visibleStart = container.scrollLeft
    const visibleEnd = container.scrollLeft + containerRect.width
    if (contentLeft - padding < visibleStart) {
      container.scrollLeft = Math.max(0, contentLeft - padding)
    } else if (contentRight + padding > visibleEnd) {
      container.scrollLeft = Math.min(container.scrollWidth - containerRect.width, contentRight + padding - containerRect.width)
    }

    const rectAfterScroll = active.getBoundingClientRect()
    const scrollLeft = container.scrollLeft

    position.left = scrollLeft + (rectAfterScroll.left - containerRect.left)
    position.right = containerRect.width - (scrollLeft + (rectAfterScroll.right - containerRect.left))
    show(previousLeft)
  }

  const update = (container?: HTMLElement, active?: Element): void => {
    if (!container || !active) {
      hide()
      return
    }

    try {
      if (options.strategy === 'edges') {
        updateEdgesPosition(container, active)
        return
      }

      updateWidthPosition(container, active)
    } catch (error) {
      options.onError?.(error)
      hide()
    }
  }

  const disconnect = (): void => {
    resizeObserver?.disconnect()
    resizeObserver = undefined
  }

  const observe = (container?: HTMLElement, onResize: () => void = () => undefined): void => {
    disconnect()
    if (!container || typeof ResizeObserver === 'undefined') return

    resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(container)
  }

  return {
    classes,
    style,
    update,
    hide,
    observe,
    disconnect,
  }
}
