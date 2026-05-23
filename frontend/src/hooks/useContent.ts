import { useContext } from "react";
import { LanguageContext } from "@/contexts/LanguageContext";
import type { ContentData } from "@/types/content";

/**
 * useContent — T-PC-B-08
 *
 * Primary hook for consuming localised content.
 *
 * Breaking changes from T-PC-A-04 synchronous version:
 * - Static JSON imports removed. Content is loaded dynamically per locale
 *   inside LanguageProvider (AC-PC-06).
 * - `getProjectBySlug` helper removed. Its only consumer (ProjectDetailPage)
 *   was migrated to read `content.projectsV2?.list.find(p => p.slug === slug)`
 *   directly (T-PC-B-08 scope).
 * - isLoading: boolean is now part of the return value (forwarded from context).
 *
 * Returns:
 *   content      — full ContentData for the active language (en-fallback applied)
 *   label(key)   — sugar for content[key]; supports top-level string keys only
 *   language     — active SupportedLanguages code
 *   setLanguage  — setter forwarded from LanguageContext
 *   isLoading    — true while a dynamic import is in-flight (AC-PC-06)
 *
 * Consumer contract:
 * - Because LanguageProvider uses option (b) — blocks render until first locale
 *   loaded — `content` is always a fully-populated ContentData when this hook
 *   is called. The `isLoading` flag signals language-switch in progress (the
 *   old content remains visible until the new locale resolves).
 *
 * Dev-mode Zod guard (AC-PC-02):
 *   The guard is preserved: import.meta.env.DEV block dynamically imports the
 *   Zod schema and validates projectsV2. Vite tree-shakes this in production.
 */
export function useContent() {
  const { language, setLanguage, content, isLoading } =
    useContext(LanguageContext);

  // T-PC-A-04 / T-PC-B-08: Dev-mode Zod guard — validates projectsV2 block
  // in development. Eliminated by Vite tree-shaking in production (AC-PC-02).
  if (import.meta.env.DEV) {
    const projectsV2 = content.projectsV2;
    if (projectsV2 !== undefined) {
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
    return "";
  }

  return { content, label, language, setLanguage, isLoading };
}
