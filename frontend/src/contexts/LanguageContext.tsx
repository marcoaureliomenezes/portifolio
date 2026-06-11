import React, { createContext, useState, useEffect, useCallback } from "react";
import type { SupportedLanguages, ContentData } from "@/types/content";

/**
 * LanguageContextValue — T-PC-B-08
 *
 * Exposes:
 * - language: active locale code
 * - setLanguage: initiates a locale switch (triggers dynamic import)
 * - content: fully-resolved ContentData for the active language (en-fallback applied)
 * - isLoading: true while a dynamic import is in-flight (initial load or language switch)
 *
 * AC-PC-06: isLoading enables consumers to show loading state during language switches.
 *
 * Option (b) loading strategy: LanguageProvider renders null until the initial locale is
 * loaded. This means all useContent() consumers receive a fully-populated content object;
 * no per-component skeleton guards are needed. During a language switch, content
 * transitions from the old locale to the new one (brief stale-content flash, acceptable
 * per SPEC §6 D7). isLoading: true signals the in-flight switch.
 *
 * SSR-safe: all browser globals (window, localStorage, navigator) are guarded.
 */

// ---------------------------------------------------------------------------
// Locale loader — uses import.meta.glob for Vite-compatible dynamic imports.
// {eager: false} ensures chunks are split per locale (the whole point of B-08).
// ---------------------------------------------------------------------------

/**
 * Load the raw ContentData for a given locale — T-RD-10 (headless Phase 1).
 *
 * Content lives OUTSIDE the JS bundle in /content/<lang>.json (served by the
 * same S3+CloudFront origin as the app). Editing content = uploading a new
 * JSON + CDN invalidation — no build, no release. `cache: "no-cache"` makes
 * the browser revalidate via ETag so an invalidation is picked up on reload
 * while unchanged content still rides the local cache.
 *
 * (Was: import.meta.glob build-time loaders — content compiled into hashed JS
 * chunks, the architectural blocker for the external admin panel. E-1.)
 */
async function loadLocaleRaw(lang: SupportedLanguages): Promise<ContentData> {
  const res = await fetch(`/content/${lang}.json`, { cache: "no-cache" });
  if (!res.ok) {
    throw new Error(
      `[LanguageContext] Failed to load locale '${lang}': HTTP ${res.status}`,
    );
  }
  return (await res.json()) as ContentData;
}

// ---------------------------------------------------------------------------
// deepMergeWithFallback — keeps the en-fallback logic co-located with the loader.
// ---------------------------------------------------------------------------

/**
 * Merge `base` (en) with `override` so that any undefined/null key in
 * `override` falls back to the `base` value. Handles one level of nesting
 * for plain objects; arrays are taken from `override` if present.
 * Fallback is always "en" (never "pt") — resolves conflict PE-08.
 */
function deepMergeWithFallback(
  base: ContentData,
  override: ContentData,
): ContentData {
  const result = { ...base };
  (Object.keys(override) as Array<keyof ContentData>).forEach((key) => {
    const overrideVal = override[key];
    const baseVal = base[key];
    if (
      overrideVal !== undefined &&
      overrideVal !== null &&
      typeof overrideVal === "object" &&
      !Array.isArray(overrideVal) &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal)
    ) {
      // Shallow merge one level of nested objects (e.g. header, resume)
      (result as Record<string, unknown>)[key] = {
        ...(baseVal as object),
        ...(overrideVal as object),
      };
    } else if (overrideVal !== undefined && overrideVal !== null) {
      (result as Record<string, unknown>)[key] = overrideVal;
    }
    // If overrideVal is undefined/null we keep the base value already in result
  });
  return result as ContentData;
}

/**
 * Load and resolve content for a locale with en fallback applied.
 * Always loads en first (as the fallback baseline), then merges the target locale.
 */
async function resolveLocale(lang: SupportedLanguages): Promise<ContentData> {
  // en is the fallback baseline — always load it.
  const enContent = await loadLocaleRaw("en");
  if (lang === "en") return enContent;
  const localeContent = await loadLocaleRaw(lang);
  return deepMergeWithFallback(enContent, localeContent);
}

// ---------------------------------------------------------------------------
// Context interface + default value
// ---------------------------------------------------------------------------

export interface LanguageContextValue {
  language: SupportedLanguages;
  setLanguage: (lang: SupportedLanguages) => void;
  content: ContentData;
  isLoading: boolean;
}

// The context default is a stub — real values come from LanguageProvider.
// `content` defaults to an empty-ish object that satisfies the type; in practice
// the app never reads this because LanguageProvider renders null until loaded.
export const LanguageContext = createContext<LanguageContextValue>({
  language: "pt",
  setLanguage: () => undefined,
  // Cast: the default is intentionally incomplete (never used — provider always renders).
  content: {} as ContentData,
  isLoading: true,
});

// ---------------------------------------------------------------------------
// Language persistence helpers
// ---------------------------------------------------------------------------

const SUPPORTED: SupportedLanguages[] = ["pt", "en", "de"];
const STORAGE_KEY = "lang";

/**
 * Detect the preferred language from navigator.language without reading
 * localStorage. Returns "pt" as the default when no match is found.
 */
function detectFromNavigator(): SupportedLanguages {
  if (typeof window === "undefined") return "pt";
  const nav = navigator.language?.slice(0, 2).toLowerCase();
  if ((SUPPORTED as string[]).includes(nav)) {
    return nav as SupportedLanguages;
  }
  return "pt";
}

/**
 * Resolve the initial language with the following priority:
 *   1. localStorage["lang"] (return visit)
 *   2. navigator.language prefix (first visit)
 *   3. "pt" (fallback)
 *
 * SSR-safe: all browser globals are guarded.
 * Storage-safe: localStorage access is wrapped in try/catch.
 *
 * Exported for unit testing.
 */
export function resolveInitialLanguage(): SupportedLanguages {
  if (typeof window === "undefined") return "pt";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (SUPPORTED as string[]).includes(stored)) {
      return stored as SupportedLanguages;
    }
  } catch {
    // localStorage unavailable (SSR, quota, private-browsing restriction)
  }
  return detectFromNavigator();
}

/**
 * Persist language choice to localStorage. No-op if storage is unavailable.
 */
function persistLanguage(lang: SupportedLanguages): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Quota exceeded or storage unavailable — silent fail
  }
}

// ---------------------------------------------------------------------------
// LanguageProvider
// ---------------------------------------------------------------------------

interface LanguageProviderProps {
  children?: React.ReactNode;
  /**
   * Explicit initial language. When provided it overrides both localStorage
   * and navigator detection (useful for testing and SSR hydration).
   */
  initialLanguage?: SupportedLanguages;
}

/**
 * LanguageProvider — T-PC-B-08
 *
 * Wraps the app tree and provides { language, setLanguage, content, isLoading }.
 *
 * Loading strategy — Option (b): the provider renders null until the first locale
 * JSON is loaded. After that, the app renders with fully-resolved content. Language
 * switches trigger isLoading: true while the new locale loads; the old content is
 * kept visible (no blank flash) until the new content is ready.
 *
 * Language resolution order (T-FE-QUAL-07):
 *   1. `initialLanguage` prop (explicit override — tests use this)
 *   2. localStorage["lang"] (persisted from previous visit)
 *   3. navigator.language prefix
 *   4. "pt" (default fallback)
 */
export function LanguageProvider({
  children,
  initialLanguage,
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguages>(
    () => initialLanguage ?? resolveInitialLanguage(),
  );
  // null means "not yet loaded" (initial state). After first load, always ContentData.
  const [content, setContent] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Stable callback so useEffect dep array doesn't need to list setLanguage* directly.
  const loadLocale = useCallback(async (lang: SupportedLanguages) => {
    setIsLoading(true);
    try {
      const resolved = await resolveLocale(lang);
      setContent(resolved);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load on mount and whenever language changes.
  useEffect(() => {
    void loadLocale(language);
  }, [language, loadLocale]);

  function setLanguage(lang: SupportedLanguages): void {
    persistLanguage(lang);
    setLanguageState(lang);
  }

  // Option (b): block render until initial content is loaded.
  // This means all useContent() consumers receive a fully-populated ContentData;
  // no per-component skeleton guards needed.
  if (content === null) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, content, isLoading }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
