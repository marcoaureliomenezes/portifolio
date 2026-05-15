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
    thresholds = [];
  }
  // @ts-expect-error attach to global for tests
  globalThis.IntersectionObserver = IntersectionObserverMock;
}
