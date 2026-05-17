import { useParams } from "react-router-dom";
import { useContent } from "@/hooks/useContent";
import { assertNever } from "@/lib/assertNever";
import { CaseStudyTemplate } from "./CaseStudyTemplate";
import { MetaProjectTemplate } from "./MetaProjectTemplate";
import { GamesProjectTemplate } from "./GamesProjectTemplate";
import NotFound from "../NotFound";
import type { ProjectsContentV2 } from "@/types/content";

/**
 * ProjectDetailPage — T-PC-B-04 / T-PC-B-08
 *
 * Dynamic dispatch page for `/projetos/:slug` routes.
 *
 * T-PC-B-08 migration: `getProjectBySlug` helper removed. Project is resolved
 * directly from `content.projectsV2.list.find(p => p.slug === slug)` — a 1-liner
 * replacement. This is the only consumer that was using the transitional helper;
 * all other consumers (3 legacy pages) were deleted in T-PC-B-06.
 *
 * Reads the slug from URL params, resolves the project from content, then
 * dispatches to the appropriate kind-specific template via `switch(project.kind)`.
 *
 * Exhaustiveness: the `default` branch calls `assertNever(project)` so that
 * TypeScript guarantees all union members are handled. Adding a new `kind` to
 * the `Project` union without updating this switch triggers a compile error.
 *
 * Unknown slug: renders `<NotFound />` inline (URL is preserved — no redirect).
 * This is required by QA contract C-07 and SPEC AC-PC-04.
 */
export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { content } = useContent();

  if (!slug) {
    return <NotFound />;
  }

  // T-PC-B-08: direct lookup replacing getProjectBySlug transitional helper.
  const projectsV2 = content.projectsV2 as ProjectsContentV2 | undefined;
  const project = projectsV2?.list?.find((p) => p.slug === slug);

  if (!project) {
    return <NotFound />;
  }

  switch (project.kind) {
    case "case-study":
      return <CaseStudyTemplate project={project} />;
    case "meta":
      return <MetaProjectTemplate project={project} />;
    case "games":
      return <GamesProjectTemplate project={project} />;
    default:
      return assertNever(project);
  }
}
