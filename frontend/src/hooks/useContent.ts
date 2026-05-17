import { useContext } from "react";
import { LanguageContext } from "@/contexts/LanguageContext";
import type {
  SupportedLanguages,
  ContentData,
  Project,
  ProjectsContentV2,
} from "@/types/content";

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

  // T-PC-A-04: Dev-mode Zod guard — validates projectsV2 block on every render
  // in development. Eliminated by Vite tree-shaking in production (AC-PC-02).
  if (import.meta.env.DEV) {
    const projectsV2 = content.projectsV2;
    if (projectsV2 !== undefined) {
      // Dynamic import of the Zod schema inside the DEV guard so that Rollup
      // can tree-shake the entire import path when building for production.
      // The import() call is async but we intentionally fire-and-forget here:
      // validation errors will appear as console.error in the browser devtools
      // without blocking the render. This mirrors the "immediate feedback in dev"
      // intent from SPEC §6 D1.
      import("@/lib/schemas/projects")
        .then(({ ProjectsContentSchema }) => {
          const result = ProjectsContentSchema.safeParse(projectsV2);
          if (!result.success) {
            console.error(
              "[useContent DEV] projectsV2 Zod validation failed:",
              result.error.issues,
            );
          }
        })
        .catch((err: unknown) => {
          console.error("[useContent DEV] Failed to load Zod schema:", err);
        });
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

/**
 * getProjectBySlug — transitional helper (T-PC-A-04).
 *
 * Resolves a project from the new `projectsV2.list` shape by slug.
 * Used by Phase B until the legacy closed-map shape and the 3 ad-hoc pages
 * are deleted. At that point this helper will be removed (T-PC-B-08).
 *
 * Falls back to undefined when the slug is not found or when projectsV2 is
 * absent (graceful degradation for Phase A).
 */
export function getProjectBySlug(
  content: ContentData,
  slug: string,
): Project | undefined {
  const projectsV2 = content.projectsV2 as ProjectsContentV2 | undefined;
  if (!projectsV2?.list) return undefined;
  return projectsV2.list.find((p) => p.slug === slug);
}
