/**
 * FeaturedProjects — T-RD-04 (AC-RD-01)
 *
 * The recruiter-facing showcase strip on the home page, directly under the
 * hero. Renders 3 curated ProjectCards (ADR-RD-03: the two PyPI libraries +
 * the meta architecture project) and a "see all" link to /projetos.
 *
 * Reuses the /projetos ProjectCard untouched — same card, new stage.
 */

import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { ContentData, ProjectsContentV2 } from "@/types/content";

/** Curated order — strongest recruiter signal first (ADR-RD-03). */
const FEATURED_SLUGS = ["rand-engine", "dadaia-workspace", "portifolio"] as const;

interface FeaturedProjectsProps {
  content: ContentData;
}

export function FeaturedProjects({ content }: FeaturedProjectsProps) {
  const projectsV2 = content.projectsV2 as ProjectsContentV2 | undefined;
  if (!projectsV2?.list?.length) return null;

  const bySlug = new Map(projectsV2.list.map((p) => [p.slug, p]));
  const featured = FEATURED_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );
  if (!featured.length) return null;

  const title = content.featuredProjectsTitle ?? "Projetos em Destaque";
  const seeAll = content.seeAllProjects ?? "Ver todos os projetos";

  return (
    <section
      id="projetos-destaque"
      aria-labelledby="featured-projects-heading"
      className="motion-safe:animate-fade-up"
    >
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2
          id="featured-projects-heading"
          className="text-xl md:text-2xl font-bold text-foreground"
        >
          {title}
        </h2>
        <Link
          to="/projetos"
          data-testid="see-all-projects"
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        >
          {seeAll}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      <div
        data-testid="featured-projects-grid"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {featured.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            kindLabels={projectsV2.index.kindLabels}
          />
        ))}
      </div>
    </section>
  );
}
