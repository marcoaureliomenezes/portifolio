import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useMediaQuery } from "./useMediaQuery";

function stubMatchMedia(initial: boolean) {
  let listener: (e: { matches: boolean }) => void = () => {};
  const mql = {
    matches: initial,
    addEventListener: vi.fn((_: string, cb: typeof listener) => {
      listener = cb;
    }),
    removeEventListener: vi.fn(),
  };
  const matchMedia = vi.fn(() => mql);
  vi.stubGlobal("matchMedia", matchMedia);
  return { mql, matchMedia, fire: (matches: boolean) => listener({ matches }) };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useMediaQuery", () => {
  it("returns the initial match for the query", () => {
    const { matchMedia } = stubMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery("(min-width: 640px)"));
    expect(result.current).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith("(min-width: 640px)");
  });

  it("updates on a change event", () => {
    const { fire } = stubMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(min-width: 640px)"));
    expect(result.current).toBe(false);
    act(() => fire(true));
    expect(result.current).toBe(true);
  });

  it("removes its change listener on unmount", () => {
    const { mql } = stubMatchMedia(false);
    const { unmount } = renderHook(() => useMediaQuery("(min-width: 640px)"));
    const added = mql.addEventListener.mock.calls[0];
    expect(added[0]).toBe("change");
    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledWith("change", added[1]);
  });

  it("returns false when matchMedia is absent", () => {
    vi.stubGlobal("matchMedia", undefined);
    const { result } = renderHook(() => useMediaQuery("(min-width: 640px)"));
    expect(result.current).toBe(false);
  });
});
