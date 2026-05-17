// v-loading-directive.ts
import type { App, ObjectDirective, DirectiveBinding } from 'vue'
import spinnerSvg from '@/features/ui/icon/icons/spinner.svg?raw'

export default function registerLoading(vue: App<Element>, name = 'loading'): void {
  vue.directive(name, createDirective())
}

function createDirective(): ObjectDirective {
  // Inject CSS only once
  function injectSpinnerAnimationCss(): void {
    if (document.getElementById('v-spinner-animation-style')) return
    const style = document.createElement('style')
    style.id = 'v-spinner-animation-style'
    style.textContent = `
    .tw-v-loading-relative { position: relative; }
    .tw-v-loading-dot {
      animation: tw-v-loading-pulse 1.2s ease-in-out infinite;
    }
    .tw-v-loading-dot-2 { animation-delay: 0.2s; }
    .tw-v-loading-dot-3 { animation-delay: 0.4s; }
    @keyframes tw-v-loading-pulse {
      0%, 100% { opacity: 0.25; }
      50%       { opacity: 1; }
    }
  `
    document.head.appendChild(style)
  }

  function getLoadingOverlayHtml(): string {
    return `
    <div class="tw-v-loading-overlay
      absolute inset-0 z-[10] flex items-center justify-center bg-white/50
      pointer-events-auto select-none
    ">
      <div class="tw-v-loading-spinner block w-8 h-2.5 text-zinc-500">${spinnerSvg}</div>
    </div>
  `
  }

  function addLoader(elem: HTMLElement): void {
    if (!elem.querySelector('.tw-v-loading-overlay')) {
      const styles = getComputedStyle(elem)
      if (styles.position === 'static') {
        elem.classList.add('tw-v-loading-relative')
      }
      const overlay = document.createElement('div')
      overlay.innerHTML = getLoadingOverlayHtml()
      // We inject <div ...><svg ... /></div>; overlay is the wrapping div (not spinner)
      elem.appendChild(overlay.firstElementChild!)
    }
  }

  function removeLoader(elem: HTMLElement): void {
    elem.classList.remove('tw-v-loading-relative')
    elem.querySelectorAll('.tw-v-loading-overlay').forEach((e) => e.remove())
  }

  return {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
      injectSpinnerAnimationCss()
      if (binding.value) {
        addLoader(el)
      }
    },
    updated(el: HTMLElement, binding: DirectiveBinding) {
      if (binding.value) {
        addLoader(el)
      } else {
        removeLoader(el)
      }
    },
    unmounted(el: HTMLElement) {
      removeLoader(el)
    },
  }
}
