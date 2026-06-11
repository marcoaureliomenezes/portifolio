import '@testing-library/jest-dom';
import { configure } from '@testing-library/dom';

// T-PC2-R2-09 (AC-PC2-R2-08, deflake): LanguageProvider blocks render until its
// dynamic locale import resolves. Under full-suite parallelism that import can
// exceed testing-library's 1s default async timeout, making every
// waitFor-after-render assertion (Header, useContent) flaky. 4s keeps real
// failures fast while removing the race.
configure({ asyncUtilTimeout: 4000 });

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
