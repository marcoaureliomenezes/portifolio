import { generateUUID } from './uuid';

/** Key used in sessionStorage — dies on tab close, no cross-session tracking. */
export const SESSION_KEY = 'dadaia_session_id';

/**
 * Returns the session_id for the current browser session.
 * Creates a new UUID v4 if none exists in sessionStorage.
 * Never throws — analytics must not break the host site.
 */
export function getOrCreateSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing !== null) {
      return existing;
    }
    const id = generateUUID();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // sessionStorage may be blocked (e.g., private mode restrictions)
    return generateUUID();
  }
}
