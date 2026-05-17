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

interface LanguageProviderProps {
  children?: React.ReactNode;
  initialLanguage?: SupportedLanguages;
}

/**
 * LanguageProvider — wraps the app tree and provides { language, setLanguage }.
 *
 * Default language is "pt" to preserve existing behaviour.
 * Consumers switch language by calling setLanguage("en" | "de" | "pt").
 */
export function LanguageProvider({
  children,
  initialLanguage = "pt",
}: LanguageProviderProps) {
  const [language, setLanguage] = useState<SupportedLanguages>(initialLanguage);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
