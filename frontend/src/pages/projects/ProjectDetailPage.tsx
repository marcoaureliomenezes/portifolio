import { useParams } from "react-router-dom";
import { useContent, getProjectBySlug } from "@/hooks/useContent";
import { assertNever } from "@/lib/assertNever";
import { CaseStudyTemplate } from "./CaseStudyTemplate";
import { MetaProjectTemplate } from "./MetaProjectTemplate";
import { GamesProjectTemplate } from "./GamesProjectTemplate";
import NotFound from "../NotFound";

/**
 * ProjectDetailPage — T-PC-B-04
 *
 * Dynamic dispatch page for `/projetos/:slug` routes.
 *
 * Reads the slug from URL params, resolves the project via `getProjectBySlug`,
 * then dispatches to the appropriate kind-specific template via `switch(project.kind)`.
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

  const project = getProjectBySlug(content, slug);

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
