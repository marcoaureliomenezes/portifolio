import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { ProjectHero } from "@/components/projects/ProjectHero";
import { ProjectSections } from "@/components/projects/ProjectSections";
import { DiagramAsset } from "@/components/projects/DiagramAsset";
import type { CaseStudyProject } from "@/types/content";

/**
 * CaseStudyTemplate — T-PC-B-03 / T-PC-C-02 (refactor)
 *
 * Renders a case-study project page. Accepts only `CaseStudyProject` (narrow type);
 * discrimination happens upstream in `ProjectDetailPage`.
 *
 * Layout: hero → body sections → GitHub CTA
 *
 * SEO: managed via `useDocumentSeo` — no imperative useEffect allowed (AC-PC-11).
 */
export function CaseStudyTemplate({ project }: { project: CaseStudyProject }) {
  useDocumentSeo({
    title: project.seo.title,
    description: project.seo.description,
  });

  const { slug, cta } = project;

  return (
    <main
      className="container mx-auto px-4 pt-36 md:pt-32 pb-12 space-y-10 max-w-4xl"
      aria-label={project.seo.title}
    >
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <ProjectHero project={project} />

      {/* ── Architecture diagram ─────────────────────────────────── */}
      {project.diagram && (
        <section aria-labelledby={`${slug}-diagram-heading`}>
          <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
            <CardHeader className="pb-2">
              <h2
                id={`${slug}-diagram-heading`}
                className="text-lg md:text-2xl font-bold text-foreground"
              >
                Arquitetura
              </h2>
            </CardHeader>
            <CardContent>
              <DiagramAsset
                light={project.diagram}
                alt={project.diagramAlt ?? "Architecture diagram"}
                className="w-full"
              />
            </CardContent>
          </Card>
        </section>
      )}

      {/* ── Body sections ────────────────────────────────────────── */}
      <ProjectSections sections={project.sections} slug={slug} />

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section aria-labelledby={`${slug}-cta-heading`}>
        <Card className="w-full shadow-medium border-0 bg-card">
          <CardHeader className="pb-2">
            <CardTitle
              id={`${slug}-cta-heading`}
              className="text-lg font-bold text-foreground sr-only"
            >
              Links
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button asChild variant="default">
              <a
                href={cta.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
                {cta.githubLabel ?? "GitHub"}
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
