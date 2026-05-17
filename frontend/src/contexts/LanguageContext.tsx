import React, { createContext, useState } from "react";
import type { SupportedLanguages } from "@/types/content";

export interface LanguageContextValue {
  language: SupportedLanguages;
  setLanguage: (lang: SupportedLanguages) => void;
}

export const LanguageContext = createContext<LanguageContextValue>({
  language: "pt",
  setLanguage: () => undefined,
});

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

interface LanguageProviderProps {
  children?: React.ReactNode;
  /**
   * Explicit initial language. When provided it overrides both localStorage
   * and navigator detection (useful for testing and SSR hydration).
   */
  initialLanguage?: SupportedLanguages;
}

/**
 * LanguageProvider — wraps the app tree and provides { language, setLanguage }.
 *
 * Language resolution order (T-FE-QUAL-07):
 *   1. `initialLanguage` prop (explicit override)
 *   2. localStorage["lang"] (persisted from previous visit)
 *   3. navigator.language prefix
 *   4. "pt" (default fallback)
 *
 * Calling setLanguage() automatically persists the choice to localStorage so
 * that the next visit restores it without re-detection.
 */
export function LanguageProvider({
  children,
  initialLanguage,
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguages>(
    () => initialLanguage ?? resolveInitialLanguage(),
  );

  function setLanguage(lang: SupportedLanguages): void {
    persistLanguage(lang);
    setLanguageState(lang);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
