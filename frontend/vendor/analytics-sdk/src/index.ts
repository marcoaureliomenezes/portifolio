/**
 * @dadaia/analytics-sdk
 * Anonymous analytics browser SDK — zero runtime dependencies, ≤3KB gzip.
 *
 * Usage:
 *   import { init, track } from '@dadaia/analytics-sdk';
 *   init({ site_id: 'portfolio', endpoint: 'https://api.dadaia.dev/ingest' });
 *   track('page_view', { path: window.location.pathname });
 */

import { setConfig, enqueue, registerFlushListeners } from './queue';
import { getOrCreateSessionId } from './session';

let listenersRegistered = false;

/**
 * Initialise the SDK. Must be called before track().
 * Safe to call multiple times — subsequent calls are idempotent within the session.
 * Eagerly creates the session_id so it is available in sessionStorage immediately.
 */
export function init(config: { site_id: string; endpoint: string }): void {
  try {
    setConfig(config);
    // Eagerly create session_id and persist it to sessionStorage
    getOrCreateSessionId();
    if (!listenersRegistered) {
      registerFlushListeners();
      listenersRegistered = true;
    }
  } catch {
    // Never throw — analytics must not break the host site
  }
}

/**
 * Queue an analytics event. No-op if init() has not been called.
 * Never throws.
 */
export function track(event_type: string, metadata?: Record<string, unknown>): void {
  try {
    enqueue(event_type, metadata);
  } catch {
    // Never throw — analytics must not break the host site
  }
}
