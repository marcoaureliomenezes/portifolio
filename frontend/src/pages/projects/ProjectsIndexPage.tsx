/**
 * ProjectsIndexPage.tsx — T-PC-C-03
 *
 * Replaces ProjectsIndexPlaceholder in App.tsx.
 * Renders the /projetos index: a grid of 3 ProjectCards in fixed order.
 *
 * Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
 * CLS = 0: aspect-ratio is enforced inside ProjectCard via aspect-video on the cover area.
 *
 * No filters/search — out of scope (Phase C spec).
 * No error boundary — out of scope for this task.
 *
 * lazy()-loaded from App.tsx as a separate chunk — do not add heavy imports here.
 */

import { useContent } from "@/hooks/useContent";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { ProjectsContentV2 } from "@/types/content";

export function ProjectsIndexPage() {
  const { content } = useContent();

  // projectsV2 is always defined when this page is rendered (content is fully loaded)
  const projectsV2 = content.projectsV2 as ProjectsContentV2;
  const { index, list } = projectsV2;

  return (
    <main className="container mx-auto px-4 pb-12 space-y-8 max-w-4xl">
      {/* Page heading — uses index.title from i18n content */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-primary">{index.title}</h1>
        {index.description && (
          <p className="text-muted-foreground">{index.description}</p>
        )}
      </div>

      {/* Project grid — fixed order: dadaia-workspace, portifolio, tauan-games */}
      <div
        data-testid="projects-grid"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {list.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </main>
  );
}
