import { Link, Outlet, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useContent } from "@/hooks/useContent";
import type { ProjectsContentV2 } from "@/types/content";

/**
 * ProjectsLayoutShell: the layout route for the project routes.
 *
 * Input: the `slug` route param (absent on the index route) and the
 * `siteChrome` and `projectsV2` content of the active locale.
 * Output: a breadcrumb nav, the child route via `<Outlet />`, and on the
 * detail route a back link placed after the child content.
 * Side effects: none. It sets no document title; children own their SEO.
 */
export function ProjectsLayoutShell() {
  const { slug } = useParams<{ slug?: string }>();
  const { content } = useContent();
  const chrome = content.siteChrome;

  const isDetail = Boolean(slug);

  // The second breadcrumb segment is the project's hero.title. Falls back to
  // the slug when the project is not in the list yet.
  const displayName = resolveDisplayName(
    content.projectsV2 as ProjectsContentV2 | undefined,
    slug,
  );

  return (
    <div className="mx-auto max-w-[960px] px-5 md:px-6 pb-12 flex flex-col min-h-screen">
      {/* ── Breadcrumb chrome ────────────────────────────────────── */}
      <nav
        aria-label={chrome?.breadcrumb.label}
        data-testid="breadcrumb"
        className="pt-6 pb-2"
      >
        <ol className="flex items-center gap-1 text-meta text-muted-foreground flex-wrap">
          <li>
            {isDetail ? (
              <Link
                to="/projetos"
                className="hover:text-primary transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                {chrome?.breadcrumb.projects}
              </Link>
            ) : (
              <span className="text-foreground">
                {chrome?.breadcrumb.projects}
              </span>
            )}
          </li>
          {isDetail && displayName && (
            <>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
              </li>
              <li>
                <span className="text-foreground">{displayName}</span>
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* ── Child route content ───────────────────────────────────── */}
      <Outlet />

      {/* ── Back-link (detail view only) ──────────────────────────── */}
      {isDetail && (
        <div className="pt-10">
          <Link
            to="/projetos"
            data-testid="back-link"
            data-role="back"
            className="inline-flex items-center gap-1.5 text-meta text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            aria-label={chrome?.backToProjects}
          >
            <ChevronLeft className="h-4 w-4" />
            {chrome?.backToProjects}
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * Resolve the breadcrumb's second segment.
 *
 * Returns hero.title of the matching project, else the slug, else undefined
 * when the slug is absent (index route).
 */
function resolveDisplayName(
  projectsV2: ProjectsContentV2 | undefined,
  slug: string | undefined,
): string | undefined {
  if (!slug) return undefined;
  const project = projectsV2?.list?.find((p) => p.slug === slug);
  return project?.hero?.title ?? slug;
}
