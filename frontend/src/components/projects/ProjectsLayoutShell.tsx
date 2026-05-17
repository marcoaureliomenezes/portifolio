import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useContent } from "@/hooks/useContent";
import type { ProjectsContentV2 } from "@/types/content";

/**
 * ProjectsLayoutShell — T-PC-B-09
 *
 * Shared chrome for all routes under /projetos/*.
 *
 * Responsibilities:
 * - Renders a breadcrumb: "Projetos" on index; "Projetos / <displayName>" on detail.
 * - Renders a back-link ("Voltar para projetos") only on detail routes.
 * - Renders <Outlet /> for the child route (index or detail).
 * - Does NOT call useDocumentSeo — that is the child's responsibility (QA contract C-06).
 * - Breadcrumb second segment uses the i18n project display name (hero.title from
 *   projectsV2.list), not the raw slug (per SPEC §10 R1 + TASKS T-PC-B-09 note 2).
 *
 * ARIA:
 * - Breadcrumb nav has aria-label="Breadcrumb" (QA contract C-04).
 * - Back-link has discernible text (not icon-only).
 *
 * SEO non-interference:
 * - Shell sets no document.title — children are responsible for their own SEO.
 *
 * AC-PC-16.
 */
export function ProjectsLayoutShell() {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const { content } = useContent();

  // Determine whether we're on the index (/projetos) or detail (/projetos/:slug).
  const isDetail = Boolean(slug);

  // Resolve the display name from i18n content.
  // The second breadcrumb segment uses hero.title from the project list — not the
  // raw slug. Falls back to the slug string if content is not yet loaded or the
  // slug is not found (graceful degradation).
  const displayName = resolveDisplayName(
    content.projectsV2 as ProjectsContentV2 | undefined,
    slug,
  );

  // Keep location reference to prevent stale closures in future extensions.
  void location;

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Breadcrumb chrome ────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="container mx-auto px-4 pt-24 md:pt-20 pb-2 max-w-4xl"
      >
        <ol className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
          <li>
            {isDetail ? (
              <Link
                to="/projetos"
                className="hover:text-primary transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                Projetos
              </Link>
            ) : (
              <span className="text-foreground font-medium">Projetos</span>
            )}
          </li>
          {isDetail && displayName && (
            <>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
              </li>
              <li>
                <span className="text-foreground font-medium">{displayName}</span>
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* ── Back-link (detail view only) ──────────────────────────── */}
      {isDetail && (
        <div className="container mx-auto px-4 pb-4 max-w-4xl">
          <Link
            to="/projetos"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            aria-label="Voltar para projetos"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar para projetos
          </Link>
        </div>
      )}

      {/* ── Child route content ───────────────────────────────────── */}
      <Outlet />
    </div>
  );
}

/**
 * Resolve a human-readable display name for the breadcrumb second segment.
 *
 * Priority:
 * 1. hero.title from projectsV2.list (i18n-aware display name).
 * 2. Raw slug as graceful fallback.
 * 3. undefined when slug is absent (index route).
 */
function resolveDisplayName(
  projectsV2: ProjectsContentV2 | undefined,
  slug: string | undefined,
): string | undefined {
  if (!slug) return undefined;
  const project = projectsV2?.list?.find((p) => p.slug === slug);
  // hero.title is the canonical display name per content contract.
  // Fall back to the slug string so the breadcrumb never shows an empty segment.
  return project?.hero?.title ?? slug;
}
