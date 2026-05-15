import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTheme } from "./useTheme";

describe("useTheme", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("falls back to system preference when nothing is stored", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (q) =>
        ({
          matches: q === "(prefers-color-scheme: dark)",
          media: q,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as MediaQueryList,
    );

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("uses stored theme when available", () => {
    window.localStorage.setItem("theme", "dark");
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
  });

  it("toggleTheme flips classlist and persists", () => {
    window.localStorage.setItem("theme", "light");
    const { result } = renderHook(() => useTheme());

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    act(() => result.current.toggleTheme());

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("theme")).toBe("dark");
  });
});
