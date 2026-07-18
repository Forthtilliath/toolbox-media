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
