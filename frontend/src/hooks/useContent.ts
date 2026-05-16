import { useContext } from "react";
import { LanguageContext } from "@/contexts/LanguageContext";
import type { SupportedLanguages, ContentData } from "@/types/content";
import { ProjectsContentSchema } from "@/lib/schemas/projects";

// Static JSON imports — Vite resolves and bundles these at build time.
// T-CONTENT-01: migrated from TypeScript constant modules to JSON files.
import ptJson from "@/data/content/pt.json";
import enJson from "@/data/content/en.json";
import deJson from "@/data/content/de.json";

const ptContent = ptJson as ContentData;
const enContent = enJson as ContentData;
const deContent = deJson as ContentData;

/** Map from locale code to raw content object. */
const contentMap: Record<SupportedLanguages, ContentData> = {
  pt: ptContent,
  en: enContent,
  de: deContent,
};

/**
 * Merge `base` (en) with `override` so that any undefined/missing key in
 * `override` falls back to the `base` value.  Handles one level of nesting
 * for plain objects; arrays are taken from `override` if present.
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
        ...(baseVal as Record<string, unknown>),
        ...(overrideVal as Record<string, unknown>),
      };
    } else if (overrideVal !== undefined && overrideVal !== null) {
      (result as Record<string, unknown>)[key] = overrideVal;
    }
    // If overrideVal is undefined/null we keep the base value already in result
  });
  return result as ContentData;
}

/**
 * Retrieve content for a given locale with en fallback for any missing keys.
 * Fallback is always "en" (never "pt") — resolves conflict PE-08.
 */
function resolveContent(language: SupportedLanguages): ContentData {
  const base = contentMap["en"];
  if (language === "en") return base;
  const override = contentMap[language];
  return deepMergeWithFallback(base, override);
}

/**
 * useContent — primary hook for consuming localised content.
 *
 * Returns:
 *   content      — full ContentData for the active language (en-fallback applied)
 *   label(key)   — sugar for content[key]; supports top-level string keys only
 *   language     — active SupportedLanguages code
 *   setLanguage  — setter forwarded from LanguageContext
 */
export function useContent() {
  const { language, setLanguage } = useContext(LanguageContext);
  const content = resolveContent(language);

  if (content.projects && import.meta.env.DEV) {
    const result = ProjectsContentSchema.safeParse(content.projects);
    if (!result.success) {
      console.error("[content] invalid projects shape", result.error);
    }
  }

  function label(key: keyof ContentData): string {
    const value = content[key];
    if (typeof value === "string") return value;
    // Non-string fields (arrays, objects) return an empty string via label();
    // callers should access content[key] directly for complex values.
    return "";
  }

  return { content, label, language, setLanguage };
}
