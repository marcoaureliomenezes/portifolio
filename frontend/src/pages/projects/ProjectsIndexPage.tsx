import { useEffect } from "react";
import { useContent } from "@/hooks/useContent";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Header } from "@/components/Header";

/**
 * ProjectsIndexPage — T-FE-PROJ-02
 *
 * Renders a responsive grid of project cards at `/projetos`.
 * Consumes `content.projects` from the active language JSON.
 * SEO: sets document.title + description meta tag via useEffect.
 */
export function ProjectsIndexPage() {
  const { content } = useContent();
  const projects = content.projects;

  useEffect(() => {
    const seo = projects?.index?.seo;
    if (!seo) return;
    document.title = seo.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", seo.description);
    }
  }, [projects?.index?.seo?.title, projects?.index?.seo?.description]);

  const kindLabels = {
    kindCaseStudy: projects?.kindCaseStudy,
    kindMeta: projects?.kindMeta,
    kindGames: projects?.kindGames,
  };

  return (
    <main className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 pt-36 md:pt-32 pb-12 max-w-5xl">
        {/* Hero */}
        <section aria-labelledby="projects-heading" className="mb-10">
          <h1
            id="projects-heading"
            className="text-3xl font-bold tracking-tight mb-2"
          >
            {projects?.index?.title ?? "Projetos"}
          </h1>
          {projects?.index?.subtitle && (
            <p className="text-muted-foreground">{projects.index.subtitle}</p>
          )}
        </section>

        {/* Grid */}
        {projects?.list && projects.list.length > 0 ? (
          <section aria-labelledby="projects-heading">
            <ul
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0"
              role="list"
            >
              {projects.list.map((project) => (
                <li key={project.slug}>
                  <ProjectCard project={project} kindLabels={kindLabels} />
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="text-muted-foreground text-sm">
            {content.projects ? "Nenhum projeto cadastrado." : "Carregando projetos..."}
          </p>
        )}
      </div>
    </main>
  );
}
