import { ExternalLink } from "lucide-react";
import { Block } from "@/components/projects/Block";
import { useContent } from "@/hooks/useContent";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { ProjectHero } from "@/components/projects/ProjectHero";
import { ProjectSections } from "@/components/projects/ProjectSections";
import { CostsTable } from "@/components/projects/CostsTable";
import { DecisionsList } from "@/components/projects/DecisionsList";
import { DiagramCard } from "@/components/projects/DiagramCard";
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

  const { content } = useContent();
  const { slug, stack, costs, decisions, links } = project;
  // T-PC2-R2-05 / AC-PC2-R2-05: headings come from content.archPage (i18n),
  // with the previous literals as fallback for older content snapshots.
  const labels = content.archPage;

  return (
    <div className="space-y-10">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <ProjectHero project={project} />

      {/* ── Architecture diagram (shared, i18n, theme-aware — T-PC2-R2-05) ── */}
      <DiagramCard project={project} />

      {/* ── Body sections ────────────────────────────────────────── */}
      <ProjectSections sections={project.sections} slug={slug} />

      {stack.length > 0 && (
        <Block id={`${slug}-stack-heading`} title={labels?.techStackTitle ?? "Tech Stack"}>
          <table className="w-full text-meta">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-label text-muted-foreground w-1/3">
                  {labels?.tableHeaderLayer ?? "Layer"}
                </th>
                <th className="text-left py-2 text-label text-foreground">
                  {labels?.tableHeaderTechnology ?? "Technology"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stack.map((row) => (
                <tr key={row.layer} data-testid="stack-row">
                  <td className="py-2 pr-4 text-muted-foreground">{row.layer}</td>
                  <td className="py-2 text-foreground text-meta">{row.tech}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Block>
      )}

      {costs.length > 0 && (
        <Block id={`${slug}-costs-heading`} title={labels?.monthlyCostsTitle ?? "Monthly Costs"}>
          <CostsTable costs={costs} />
        </Block>
      )}

      {decisions.length > 0 && (
        <Block
          id={`${slug}-decisions-heading`}
          title={labels?.archDecisionsTitle ?? "Architectural Decisions"}
        >
          <DecisionsList decisions={decisions} />
        </Block>
      )}

      <Block id={`${slug}-links-heading`} title={labels?.linksTitle ?? "Links"}>
        <div className="flex flex-wrap gap-4">
          {[
            [links.repo, labels?.linkGithubRepo ?? "GitHub Repository"],
            [links.terraform, labels?.linkTerraform ?? "Terraform"],
            [links.specs, labels?.linkSpecs ?? "Specs"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-meta text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              {label}
            </a>
          ))}
        </div>
      </Block>
    </div>
  );
}
