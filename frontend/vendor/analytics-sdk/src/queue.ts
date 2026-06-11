import { getOrCreateSessionId } from './session';

export interface Event {
  site_id: string;
  session_id: string;
  event_type: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface Config {
  site_id: string;
  endpoint: string;
}

let config: Config | null = null;
const queue: Event[] = [];

/** Called once by init() to set module-level config. */
export function setConfig(cfg: Config): void {
  config = cfg;
}

/** Returns whether the SDK has been initialised. */
export function isInitialised(): boolean {
  return config !== null;
}

/** Push an event onto the in-memory queue. */
export function enqueue(event_type: string, metadata?: Record<string, unknown>): void {
  if (!config) return;
  queue.push({
    site_id: config.site_id,
    session_id: getOrCreateSessionId(),
    event_type,
    timestamp: new Date().toISOString(),
    ...(metadata !== undefined ? { metadata } : {}),
  });
}

/**
 * Flush the in-memory queue via navigator.sendBeacon.
 * Beacon survives page unload; the queue is cleared after flush.
 * Never throws — analytics must not break the host site.
 */
export function flush(): void {
  if (!config || queue.length === 0) return;
  try {
    const payload = JSON.stringify(queue.splice(0));
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(config.endpoint, blob);
  } catch {
    // Silently swallow — analytics must never break the host site
  }
}

/** Register DOM event listeners that trigger flush. Called once by init(). */
export function registerFlushListeners(): void {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flush();
    }
  });
  window.addEventListener('pagehide', () => {
    flush();
  });
}
