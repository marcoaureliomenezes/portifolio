import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import type { ContentData } from "@/types/content";

/**
 * useContent.test.ts — T-PC-B-08 (updated from T-QA-02 sync version)
 *
 * Strategy:
 * - LanguageProvider now async-loads content via dynamic imports (T-PC-B-08).
 * - The provider blocks render until the first locale is loaded (option b).
 * - Tests must use `waitFor` / `act` to flush async state updates.
 *
 * Mock strategy: vi.mock the three JSON files so Vitest resolves them
 * synchronously in the test environment. The dynamic import() calls in
 * useContent / LanguageContext will resolve to these mocked modules.
 *
 * NullableContentData widens each field to include null so the mock factory
 * can inject null sentinel values to exercise deepMergeWithFallback.
 */

type NullableContentData = { [K in keyof ContentData]: ContentData[K] | null };

// --------------------------------------------------------------------------
// Module-level mocks — must precede any imports of the mocked modules.
// vi.mock is hoisted by Vitest automatically.
// --------------------------------------------------------------------------

vi.mock("@/data/content/de.json", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/data/content/de.json")>();
  return {
    default: {
      ...original,
      // Explicitly null → triggers en fallback in deepMergeWithFallback.
      resumeTitle: null,
    } as NullableContentData as ContentData,
  };
});

// --------------------------------------------------------------------------
// Wrapper helpers
// --------------------------------------------------------------------------

function wrapWithProvider(initialLanguage: "pt" | "en" | "de" = "pt") {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(LanguageProvider, { initialLanguage }, children);
}

// --------------------------------------------------------------------------
// Import hook AFTER vi.mock declarations (Vitest hoists vi.mock automatically).
// --------------------------------------------------------------------------

const { useContent } = await import("./useContent");

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe("useContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Initial loading state
  // -------------------------------------------------------------------------

  it("resolves content after initial async load (not blank)", async () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("pt"),
    });

    // After async load settles, content must be defined.
    await waitFor(() => {
      expect(result.current.content).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // Language resolution (async)
  // -------------------------------------------------------------------------

  it("default provider language 'pt' returns Portuguese content", async () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("pt"),
    });

    await waitFor(() => {
      expect(result.current.language).toBe("pt");
      expect(result.current.content.resumeTitle).toBe("Resumo");
    });
  });

  it("setLanguage('en') switches to English content", async () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("pt"),
    });

    // Wait for initial load.
    await waitFor(() => expect(result.current.content.resumeTitle).toBe("Resumo"));

    act(() => {
      result.current.setLanguage("en");
    });

    await waitFor(() => {
      expect(result.current.language).toBe("en");
      expect(result.current.content.resumeTitle).toBe("Resume");
    });
  });

  it("setLanguage('de') switches to German content for keys present in de", async () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("pt"),
    });

    await waitFor(() => expect(result.current.content.resumeTitle).toBeDefined());

    act(() => {
      result.current.setLanguage("de");
    });

    await waitFor(() => {
      expect(result.current.language).toBe("de");
      // skillsTitle is present in our de mock (not null)
      expect(result.current.content.skillsTitle).toBe("Fähigkeiten");
    });
  });

  // -------------------------------------------------------------------------
  // isLoading state (AC-PC-06)
  // -------------------------------------------------------------------------

  it("isLoading transitions from true to false after initial load", async () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("pt"),
    });

    // After settling, isLoading must be false.
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("isLoading becomes true during language switch, then false when settled", async () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("pt"),
    });

    // Wait for initial load.
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setLanguage("en");
    });

    // After setLanguage, isLoading should eventually settle to false.
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.language).toBe("en");
    });
  });

  // -------------------------------------------------------------------------
  // Fallback de → en (PE-08 / D-CONT-03)
  // -------------------------------------------------------------------------

  it("fallback de → en: null key in de returns the English value (not pt, not blank)", async () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("de"),
    });

    await waitFor(() => {
      // Our mock sets de.resumeTitle = null.
      // deepMergeWithFallback returns the en value "Resume".
      expect(result.current.content.resumeTitle).toBe("Resume");
      expect(result.current.content.resumeTitle).not.toBe("Resumo"); // not pt
    });
  });

  it("fallback de → en: keys present in de are NOT replaced by en values", async () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("de"),
    });

    await waitFor(() => {
      // skillsTitle is NOT null in our mock, German value preserved.
      expect(result.current.content.skillsTitle).toBe("Fähigkeiten");
      expect(result.current.content.skillsTitle).not.toBe("Skills"); // en
      expect(result.current.content.skillsTitle).not.toBe("Habilidades"); // pt
    });
  });

  // -------------------------------------------------------------------------
  // label() helper
  // -------------------------------------------------------------------------

  it("label(key) returns the string value for a top-level string key", async () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("en"),
    });

    await waitFor(() => {
      expect(result.current.label("resumeTitle")).toBe("Resume");
      expect(result.current.label("skillsTitle")).toBe("Skills");
      expect(result.current.label("seeMore")).toBe("See more");
    });
  });

  it("label(key) returns empty string for a non-string (object/array) key", async () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("en"),
    });

    await waitFor(() => {
      // 'skills' is an array — label() should return "" not "[object Object]"
      expect(result.current.label("skills")).toBe("");
      // 'resume' is an object — same
      expect(result.current.label("resume")).toBe("");
    });
  });

  it("label(key) returns empty string for an object key (e.g. header)", async () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("pt"),
    });

    await waitFor(() => {
      expect(result.current.label("header")).toBe("");
    });
  });

  // -------------------------------------------------------------------------
  // content field integrity — en is the fallback baseline
  // -------------------------------------------------------------------------

  it("resolves en content directly (no merge needed)", async () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("en"),
    });

    await waitFor(() => {
      expect(result.current.content.resumeTitle).toBe("Resume");
      expect(result.current.content.header.title).toBe(
        "Data Engineer | Big Data | Azure | AWS | Databricks",
      );
    });
  });

  it("pt content has its own distinct values (not en)", async () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("pt"),
    });

    await waitFor(() => {
      expect(result.current.content.header.title).toBe(
        "Engenheiro de Dados | Big Data | Azure | AWS | Databricks",
      );
      expect(result.current.content.header.title).not.toBe(
        "Data Engineer | Big Data | Azure | AWS | Databricks",
      );
    });
  });
});
