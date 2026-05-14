import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useIsMobile } from "./use-mobile";

/**
 * use-mobile.test.tsx — T-QA-02
 *
 * Strategy: jsdom does not implement matchMedia. We provide a minimal
 * implementation that tracks listeners so we can fire `change` events
 * programmatically, matching how the hook registers its listener.
 */

// --------------------------------------------------------------------------
// matchMedia mock helpers
// --------------------------------------------------------------------------

type MediaQueryListenerCb = (evt: MediaQueryListEvent) => void;

interface MockMediaQueryList {
  matches: boolean;
  media: string;
  listeners: Set<MediaQueryListenerCb>;
  addEventListener(type: string, cb: MediaQueryListenerCb): void;
  removeEventListener(type: string, cb: MediaQueryListenerCb): void;
}

let currentMql: MockMediaQueryList | null = null;

/**
 * Install a matchMedia mock that:
 *  - returns `matches: true` when `innerWidth < 768`
 *  - exposes `currentMql` so tests can fire `change` events
 */
function installMatchMediaMock(innerWidth: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: innerWidth,
  });

  currentMql = {
    matches: innerWidth < 768,
    media: "(max-width: 767px)",
    listeners: new Set<MediaQueryListenerCb>(),
    addEventListener(_type: string, cb: MediaQueryListenerCb) {
      this.listeners.add(cb);
    },
    removeEventListener(_type: string, cb: MediaQueryListenerCb) {
      this.listeners.delete(cb);
    },
  };

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockReturnValue(currentMql),
  });
}

/**
 * Simulate a viewport resize by updating innerWidth and firing the
 * `change` event through the tracked matchMedia listeners.
 */
function simulateResize(newWidth: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: newWidth,
  });
  if (currentMql) {
    // Fire every registered listener with a synthetic MediaQueryListEvent
    currentMql.listeners.forEach((cb) =>
      cb({ matches: newWidth < 768 } as MediaQueryListEvent),
    );
  }
}

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe("useIsMobile", () => {
  beforeEach(() => {
    currentMql = null;
    vi.restoreAllMocks();
  });

  it("returns true when viewport width is below 768px (375px)", () => {
    installMatchMediaMock(375);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("returns true when viewport width is exactly 767px (boundary — still mobile)", () => {
    installMatchMediaMock(767);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("returns false when viewport width is exactly 768px (boundary — not mobile)", () => {
    installMatchMediaMock(768);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns false when viewport width is above 768px (1280px desktop)", () => {
    installMatchMediaMock(1280);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("reacts to resize: transitions from mobile to desktop", () => {
    installMatchMediaMock(375);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    act(() => {
      simulateResize(1280);
    });

    expect(result.current).toBe(false);
  });

  it("reacts to resize: transitions from desktop to mobile", () => {
    installMatchMediaMock(1280);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      simulateResize(375);
    });

    expect(result.current).toBe(true);
  });

  it("removes the matchMedia listener on unmount (no memory leak)", () => {
    installMatchMediaMock(375);
    const { unmount } = renderHook(() => useIsMobile());
    expect(currentMql!.listeners.size).toBe(1);
    unmount();
    expect(currentMql!.listeners.size).toBe(0);
  });
});
