import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import type { ContentData } from "@/types/content";

// NullableContentData widens each field to include null so that the vi.mock
// factory can inject null sentinel values to exercise deepMergeWithFallback.
// This is the correct structural supertype bridging cast — not a type suppression.
type NullableContentData = { [K in keyof ContentData]: ContentData[K] | null };

/**
 * useContent.test.ts — T-QA-02
 *
 * Strategy: wrap renderHook with LanguageProvider so useContext receives a
 * real context value. For the fallback test (PE-08 / D-CONT-03) we mock the
 * german content JSON module via vi.mock to inject a shape that has one top-level
 * key set to null, proving the en fallback fires.
 */

// --------------------------------------------------------------------------
// Module-level mock for de content JSON (T-CONTENT-01 — now imports from .json)
// --------------------------------------------------------------------------

// We mock the de.json module to expose a version with `resumeTitle` set to null,
// so deepMergeWithFallback must fall back to the en value.
vi.mock("@/data/content/de.json", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/data/content/de.json")>();
  return {
    default: {
      ...original,
      // Explicitly absent key — triggers en fallback in deepMergeWithFallback.
      // NullableContentData is a structural supertype that accepts null fields;
      // casting through it to ContentData is a proper bridging assertion.
      resumeTitle: null,
    } as NullableContentData as ContentData,
  };
});

// --------------------------------------------------------------------------
// Wrapper helpers
// --------------------------------------------------------------------------

function wrapWithProvider(initialLanguage: "pt" | "en" | "de" = "pt") {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      LanguageProvider,
      { initialLanguage },
      children,
    );
}

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

// Import useContent AFTER vi.mock declarations so the mock is applied
// (vitest hoists vi.mock to top of file automatically).
const { useContent } = await import("./useContent");

describe("useContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Language resolution
  // -------------------------------------------------------------------------

  it("default provider language 'pt' returns Portuguese content", () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("pt"),
    });

    expect(result.current.language).toBe("pt");
    // Portuguese-specific string present in the resolved content
    expect(result.current.content.resumeTitle).toBe("Resumo");
  });

  it("setLanguage('en') switches to English content", () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("pt"),
    });

    act(() => {
      result.current.setLanguage("en");
    });

    expect(result.current.language).toBe("en");
    expect(result.current.content.resumeTitle).toBe("Resume");
  });

  it("setLanguage('de') switches to German content for keys present in de", () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("pt"),
    });

    act(() => {
      result.current.setLanguage("de");
    });

    expect(result.current.language).toBe("de");
    // A key that IS present in de (not null in our mock)
    expect(result.current.content.skillsTitle).toBe("Fähigkeiten");
  });

  // -------------------------------------------------------------------------
  // Fallback de → en (PE-08 / D-CONT-03)
  // Scenario: a key that is null/missing in the de mock resolves to en value.
  // This is the critical acceptance criterion for T-QA-02.
  // -------------------------------------------------------------------------

  it("fallback de → en: null key in de returns the English value (not pt, not blank)", () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("de"),
    });

    // Our mock sets germanContent.resumeTitle = null.
    // deepMergeWithFallback must therefore return the en value "Resume".
    expect(result.current.content.resumeTitle).toBe("Resume");
    expect(result.current.content.resumeTitle).not.toBe("Resumo"); // not pt
    expect(result.current.content.resumeTitle).not.toBe("Zusammenfassung"); // not real de
  });

  it("fallback de → en: other de keys that are present are NOT replaced by en values", () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("de"),
    });

    // skillsTitle is NOT null in our mock, so German value should be preserved
    expect(result.current.content.skillsTitle).toBe("Fähigkeiten");
    expect(result.current.content.skillsTitle).not.toBe("Skills"); // en
    expect(result.current.content.skillsTitle).not.toBe("Habilidades"); // pt
  });

  // -------------------------------------------------------------------------
  // label() helper
  // -------------------------------------------------------------------------

  it("label(key) returns the string value for a top-level string key", () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("en"),
    });

    expect(result.current.label("resumeTitle")).toBe("Resume");
    expect(result.current.label("skillsTitle")).toBe("Skills");
    expect(result.current.label("seeMore")).toBe("See more");
  });

  it("label(key) returns empty string for a non-string (object/array) key", () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("en"),
    });

    // 'skills' is an array — label() should return "" not "[object Object]"
    expect(result.current.label("skills")).toBe("");
    // 'resume' is an object — same
    expect(result.current.label("resume")).toBe("");
  });

  it("label(key) returns empty string for an object key (e.g. header)", () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("pt"),
    });

    expect(result.current.label("header")).toBe("");
  });

  // -------------------------------------------------------------------------
  // content field integrity — en is the fallback baseline
  // -------------------------------------------------------------------------

  it("resolves en content directly (no merge needed)", () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("en"),
    });

    expect(result.current.content.resumeTitle).toBe("Resume");
    expect(result.current.content.header.title).toBe(
      "Data Engineer | Big Data | Azure | AWS | Databricks",
    );
  });

  it("pt content has its own distinct values (not en)", () => {
    const { result } = renderHook(() => useContent(), {
      wrapper: wrapWithProvider("pt"),
    });

    expect(result.current.content.header.title).toBe(
      "Engenheiro de Dados | Big Data | Azure | AWS | Databricks",
    );
    expect(result.current.content.header.title).not.toBe(
      "Data Engineer | Big Data | Azure | AWS | Databricks",
    );
  });
});
