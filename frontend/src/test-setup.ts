import '@testing-library/jest-dom';
import { configure } from '@testing-library/dom';

// T-PC2-R2-09 (AC-PC2-R2-08, deflake): LanguageProvider blocks render until its
// dynamic locale import resolves. Under full-suite parallelism that import can
// exceed testing-library's 1s default async timeout, making every
// waitFor-after-render assertion (Header, useContent) flaky. 4s keeps real
// failures fast while removing the race.
configure({ asyncUtilTimeout: 4000 });

// ---------------------------------------------------------------------------
// T-RD-10 (headless Phase 1): content is fetched from /content/<lang>.json at
// runtime. In jsdom there is no static-file server, so serve those URLs from
// public/content/ on disk. Tests may layer their own fetch overrides on top.
// ---------------------------------------------------------------------------
import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';

const realFetch = globalThis.fetch?.bind(globalThis);
globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.pathname
        : (input as Request).url;
  const match = /^\/content\/(pt|en|de)\.json$/.exec(url);
  if (match) {
    const file = resolvePath(process.cwd(), 'public/content', `${match[1]}.json`);
    const body = readFileSync(file, 'utf-8');
    return Promise.resolve(
      new Response(body, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }
  if (!realFetch) {
    return Promise.reject(new Error(`No fetch available for ${url}`));
  }
  return realFetch(input, init);
}) as typeof fetch;

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
