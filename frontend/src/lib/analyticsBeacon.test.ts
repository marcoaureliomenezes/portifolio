import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function initAndHide(endpoint: string) {
  vi.resetModules();
  const { init, track } = await import('@dadaia/analytics-sdk');
  init({ site_id: 'portfolio', endpoint });
  track('page_view');
  Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('analytics SDK beacon', () => {
  let beacon: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    beacon = vi.fn(() => true);
    Object.defineProperty(navigator, 'sendBeacon', { value: beacon, configurable: true });
  });
  afterEach(() => {
    Reflect.deleteProperty(document, 'visibilityState');
  });

  it('sends nothing when the endpoint is empty', async () => {
    await initAndHide('');
    expect(beacon).not.toHaveBeenCalled();
  });

  it('beacons the configured endpoint once', async () => {
    await initAndHide('https://ingest.example.test/v1');
    expect(beacon).toHaveBeenCalledTimes(1);
    expect(beacon.mock.calls[0][0]).toBe('https://ingest.example.test/v1');
  });
});
