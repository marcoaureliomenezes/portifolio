/**
 * UUID v4 generator — zero external dependencies.
 * Uses crypto.randomUUID() when available (all modern browsers + Safari 15.4+).
 * Falls back to crypto.getRandomValues() for older environments.
 */
export function generateUUID(): string {
  // justification: crypto.randomUUID is available in modern browsers (Chrome 92+, Safari 15.4+, FF 95+)
  // We use unknown intermediate cast to safely check the property at runtime
  const cr = crypto as unknown as Record<string, unknown>;
  if (typeof cr['randomUUID'] === 'function') {
    // justification: type-guarded above; safe to cast
    return (crypto as unknown as { randomUUID(): string }).randomUUID();
  }
  // Fallback: manual formatting with getRandomValues
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // Set version 4
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  // Set variant bits (10xx)
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return (
    hex.slice(0, 8) +
    '-' +
    hex.slice(8, 12) +
    '-' +
    hex.slice(12, 16) +
    '-' +
    hex.slice(16, 20) +
    '-' +
    hex.slice(20)
  );
}
