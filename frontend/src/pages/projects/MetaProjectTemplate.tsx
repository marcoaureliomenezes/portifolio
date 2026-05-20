import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { ProjectHero } from "@/components/projects/ProjectHero";
import { ProjectSections } from "@/components/projects/ProjectSections";
import { CostsTable } from "@/components/projects/CostsTable";
import { DecisionsList } from "@/components/projects/DecisionsList";
import { DiagramAsset } from "@/components/projects/DiagramAsset";
import type { MetaProject } from "@/types/content";

/**
 * MetaProjectTemplate — T-PC-B-03 / T-PC-C-02 (refactor)
 *
 * Renders a meta project page (the portfolio itself).
 * Accepts only `MetaProject` (narrow type); discrimination upstream in `ProjectDetailPage`.
 *
 * Layout: hero → sections → stack → costs → decisions → links
 *
 * SEO: managed via `useDocumentSeo` — no imperative useEffect allowed (AC-PC-11).
 */
export function MetaProjectTemplate({ project }: { project: MetaProject }) {
  useDocumentSeo({
    title: project.seo.title,
    description: project.seo.description,
  });

  const { slug, stack, costs, decisions, links } = project;

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

      {/* ── Tech Stack ───────────────────────────────────────────── */}
      {stack.length > 0 && (
        <section aria-labelledby={`${slug}-stack-heading`}>
          <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle
                id={`${slug}-stack-heading`}
                className="text-lg md:text-2xl font-bold text-foreground"
              >
                Tech Stack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium w-1/3">
                      Layer
                    </th>
                    <th className="text-left py-2 text-foreground font-medium">
                      Technology
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stack.map((row) => (
                    <tr key={row.layer} data-testid="stack-row">
                      <td className="py-2 pr-4 text-muted-foreground">{row.layer}</td>
                      <td className="py-2 text-foreground font-mono text-xs">{row.tech}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>
      )}

      {/* ── Monthly Costs ─────────────────────────────────────────── */}
      {costs.length > 0 && (
        <section aria-labelledby={`${slug}-costs-heading`}>
          <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle
                id={`${slug}-costs-heading`}
                className="text-lg md:text-2xl font-bold text-foreground"
              >
                Monthly Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CostsTable costs={costs} />
            </CardContent>
          </Card>
        </section>
      )}

      {/* ── Architectural Decisions ───────────────────────────────── */}
      {decisions.length > 0 && (
        <section aria-labelledby={`${slug}-decisions-heading`}>
          <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle
                id={`${slug}-decisions-heading`}
                className="text-lg md:text-2xl font-bold text-foreground"
              >
                Architectural Decisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DecisionsList decisions={decisions} />
            </CardContent>
          </Card>
        </section>
      )}

      {/* ── Links ────────────────────────────────────────────────── */}
      <section aria-labelledby={`${slug}-links-heading`}>
        <Card className="w-full shadow-medium border-0 bg-card">
          <CardHeader className="pb-2">
            <CardTitle
              id={`${slug}-links-heading`}
              className="text-lg font-bold text-foreground"
            >
              Links
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <a
              href={links.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              GitHub Repository
            </a>
            <a
              href={links.terraform}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              Terraform
            </a>
            <a
              href={links.specs}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              Specs
            </a>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
