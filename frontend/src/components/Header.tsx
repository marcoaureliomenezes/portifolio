import { useContent } from "@/hooks/useContent";
import type { SupportedLanguages } from "@/types/content";
import profileAvatar from "@/assets/profile.png";
import { profile } from "@/data/profile";
import { HeaderShell } from "./header/HeaderShell";

/** Maps old display-name strings to locale codes (bridge for T-FE-04 consumers). */
const DISPLAY_TO_LOCALE: Record<string, SupportedLanguages> = {
  Português: "pt",
  English: "en",
  Deutsch: "de",
  pt: "pt",
  en: "en",
  de: "de",
};

/** Maps locale codes back to display names for legacy consumers. */
const LOCALE_TO_DISPLAY: Record<SupportedLanguages, string> = {
  pt: "Português",
  en: "English",
  de: "Deutsch",
};

interface HeaderProps {
  name?: string;
  /** Accepts both locale codes ("pt"|"en"|"de") and legacy display names. */
  language?: string;
  /** Called with the same format as the input language (locale code or display name). */
  onLanguageChange?: (language: string) => void;
}

export const Header = ({
  name = "Marco Aurelio Menezes",
  language,
  onLanguageChange,
}: HeaderProps) => {
  const { content, language: contextLanguage, setLanguage } = useContent();

  // Resolve active locale — prop takes precedence over context
  const activeLocale: SupportedLanguages =
    language != null
      ? (DISPLAY_TO_LOCALE[language] ?? contextLanguage)
      : contextLanguage;

  const handleLanguageChange = (newLocale: SupportedLanguages) => {
    if (onLanguageChange) {
      // Forward in the same format that was originally passed in
      const isLegacy = language != null && !(language === "pt" || language === "en" || language === "de");
      onLanguageChange(isLegacy ? LOCALE_TO_DISPLAY[newLocale] : newLocale);
    } else {
      setLanguage(newLocale);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-b from-slate-900 to-slate-800 text-header-text w-full z-30 transition-all duration-300 shadow-lg border-b border-slate-700/30">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 transition-all duration-300">
        <HeaderShell
          name={name}
          email={profile.email}
          avatarUrl={profileAvatar}
          language={activeLocale}
          onLanguageChange={handleLanguageChange}
          headerInfo={content.header}
        />
      </div>
    </header>
  );
};
