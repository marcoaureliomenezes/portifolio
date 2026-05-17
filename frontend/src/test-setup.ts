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
  globalThis.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;
}
