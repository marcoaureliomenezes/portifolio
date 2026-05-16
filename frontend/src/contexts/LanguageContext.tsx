import React, { createContext, useCallback, useState } from "react";
import type { SupportedLanguages } from "@/types/content";

const SUPPORTED: SupportedLanguages[] = ["pt", "en", "de"];
const STORAGE_KEY = "lang";

export interface LanguageContextValue {
  language: SupportedLanguages;
  setLanguage: (lang: SupportedLanguages) => void;
}

export const LanguageContext = createContext<LanguageContextValue>({
  language: "pt",
  setLanguage: () => undefined,
});

interface LanguageProviderProps {
  children?: React.ReactNode;
  initialLanguage?: SupportedLanguages;
}

/**
 * LanguageProvider — wraps the app tree and provides { language, setLanguage }.
 *
 * Default language is "pt" to preserve existing behaviour.
 * Persists the selected language in localStorage["lang"] so page reloads
 * restore the user's last choice.
 * Consumers switch language by calling setLanguage("en" | "de" | "pt").
 */
export function LanguageProvider({
  children,
  initialLanguage = "pt",
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguages>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguages | null;
    return stored !== null && SUPPORTED.includes(stored) ? stored : initialLanguage;
  });

  const setLanguage = useCallback((lang: SupportedLanguages) => {
    localStorage.setItem(STORAGE_KEY, lang);
    setLanguageState(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
