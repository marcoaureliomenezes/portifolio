import '@testing-library/jest-dom';

// IntersectionObserver polyfill for jsdom (T-FE-WAVE2)
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class IntersectionObserverMock {
    constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] { return []; }
    root = null;
    rootMargin = '';
    thresholds: ReadonlyArray<number> = [];
  }
  // Object.defineProperty avoids the need for a type assertion when assigning
  // a partial mock class to a global that expects a sealed browser interface.
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    value: IntersectionObserverMock,
    writable: true,
    configurable: true,
  });
}
