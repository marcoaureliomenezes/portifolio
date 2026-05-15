import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SupportedLanguages } from "@/types/content";

interface LanguageSelectorProps {
  language: SupportedLanguages;
  onLanguageChange: (language: SupportedLanguages) => void;
  compact?: boolean;
}

const LANGUAGE_OPTIONS: { value: SupportedLanguages; label: string; short: string }[] = [
  { value: "pt", label: "Português", short: "PT" },
  { value: "en", label: "English", short: "EN" },
  { value: "de", label: "Deutsch", short: "DE" },
];

export function LanguageSelector({
  language,
  onLanguageChange,
  compact = false,
}: LanguageSelectorProps) {
  const current = LANGUAGE_OPTIONS.find((o) => o.value === language);

  if (compact) {
    return (
      <Select value={language} onValueChange={(v) => onLanguageChange(v as SupportedLanguages)}>
        <SelectTrigger
          className="w-12 h-6 bg-transparent border-header-text/30 text-header-text hover:bg-header-text/10 text-xs px-1"
          aria-label="Select language"
        >
          <SelectValue>{current?.short ?? language.toUpperCase()}</SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-header-bg border-header-text/30 z-50">
          {LANGUAGE_OPTIONS.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="text-header-text hover:bg-header-text/10 focus:bg-header-text/10 text-xs"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={language} onValueChange={(v) => onLanguageChange(v as SupportedLanguages)}>
      <SelectTrigger
        className="w-28 h-8 bg-transparent border-header-text/30 text-header-text hover:bg-header-text/10 text-sm"
        aria-label="Select language"
      >
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent className="bg-header-bg border-header-text/30 z-50">
        {LANGUAGE_OPTIONS.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="text-header-text hover:bg-header-text/10 focus:bg-header-text/10"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
