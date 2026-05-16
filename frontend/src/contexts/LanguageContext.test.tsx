/**
 * LanguageContext.test.tsx — T-FE-QUAL-07
 *
 * Targets:
 *  - setLanguage writes to localStorage["lang"]
 *  - LanguageProvider reads localStorage["lang"] on mount and restores the language
 *  - Only valid language codes are accepted from localStorage (fallback to "pt")
 */

import { act, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useContext } from "react";
import { LanguageContext, LanguageProvider } from "./LanguageContext";
import type { SupportedLanguages } from "@/types/content";

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function renderLanguageProvider(initialLanguage?: SupportedLanguages) {
  return renderHook(() => useContext(LanguageContext), {
    wrapper: ({ children }) => (
      <LanguageProvider initialLanguage={initialLanguage}>
        {children}
      </LanguageProvider>
    ),
  });
}

// --------------------------------------------------------------------------
// Setup / teardown
// --------------------------------------------------------------------------

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe("LanguageProvider — localStorage persistence", () => {
  it("defaults to 'pt' when localStorage is empty", () => {
    const { result } = renderLanguageProvider();
    expect(result.current.language).toBe("pt");
  });

  it("setLanguage writes the chosen language to localStorage", () => {
    const { result } = renderLanguageProvider();

    act(() => {
      result.current.setLanguage("en");
    });

    expect(window.localStorage.getItem("lang")).toBe("en");
    expect(result.current.language).toBe("en");
  });

  it("setLanguage('de') persists 'de' to localStorage", () => {
    const { result } = renderLanguageProvider();

    act(() => {
      result.current.setLanguage("de");
    });

    expect(window.localStorage.getItem("lang")).toBe("de");
    expect(result.current.language).toBe("de");
  });

  it("reads stored language from localStorage on mount", () => {
    window.localStorage.setItem("lang", "en");

    const { result } = renderLanguageProvider();

    expect(result.current.language).toBe("en");
  });

  it("reads 'de' from localStorage on mount", () => {
    window.localStorage.setItem("lang", "de");

    const { result } = renderLanguageProvider();

    expect(result.current.language).toBe("de");
  });

  it("falls back to initialLanguage when localStorage value is invalid", () => {
    window.localStorage.setItem("lang", "fr"); // unsupported language

    const { result } = renderLanguageProvider("pt");

    expect(result.current.language).toBe("pt");
  });

  it("falls back to 'pt' when localStorage value is garbage", () => {
    window.localStorage.setItem("lang", "xyzzy");

    const { result } = renderLanguageProvider();

    expect(result.current.language).toBe("pt");
  });

  it("localStorage value takes precedence over initialLanguage prop", () => {
    window.localStorage.setItem("lang", "de");

    // Even if initialLanguage is 'en', stored 'de' wins
    const { result } = renderLanguageProvider("en");

    expect(result.current.language).toBe("de");
  });

  it("renders children and exposes language via context", () => {
    window.localStorage.setItem("lang", "en");

    render(
      <LanguageProvider>
        <span data-testid="lang-output">language-loaded</span>
      </LanguageProvider>
    );

    expect(screen.getByTestId("lang-output")).toBeInTheDocument();
  });
});
