import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement ResizeObserver, but Radix's Slider (and other
// size-aware primitives) call it unconditionally on mount.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// jsdom doesn't implement Element.scrollTo, but Layout calls it on route change.
if (typeof Element.prototype.scrollTo === 'undefined') {
  Element.prototype.scrollTo = function (this: Element, x?: number | ScrollToOptions, y?: number) {
    if (typeof x === 'object') {
      if (x.left !== undefined) this.scrollLeft = x.left
      if (x.top !== undefined) this.scrollTop = x.top
    } else {
      if (x !== undefined) this.scrollLeft = x
      if (y !== undefined) this.scrollTop = y
    }
  }
}
