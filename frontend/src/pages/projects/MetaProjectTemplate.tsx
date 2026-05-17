import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import type { MetaProject, ProjectSectionData } from "@/types/content";

/**
 * MetaProjectTemplate — T-PC-B-03
 *
 * Renders a meta project page (the portfolio itself).
 * Accepts only `MetaProject` (narrow type); discrimination upstream in `ProjectDetailPage`.
 *
 * Layout: hero → tech badges → sections → stack → costs → decisions → links
 *
 * SEO: managed via `useDocumentSeo` — no imperative useEffect allowed (AC-PC-11).
 */
export function MetaProjectTemplate({ project }: { project: MetaProject }) {
  useDocumentSeo({
    title: project.seo.title,
    description: project.seo.description,
  });

  const { slug, hero, card, sections, stack, costs, decisions, links } = project;

  return (
    <main
      className="container mx-auto px-4 pt-36 md:pt-32 pb-12 space-y-10 max-w-4xl"
      aria-label={project.seo.title}
    >
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section aria-labelledby={`${slug}-hero-heading`}>
        <Card className="w-full shadow-glow border-0 bg-gradient-to-br from-card to-accent/30 hover:shadow-large transition-all duration-300">
          <CardContent className="pt-8 pb-6 flex flex-col items-center text-center gap-4">
            <h1
              id={`${slug}-hero-heading`}
              className="text-2xl md:text-4xl font-bold text-primary"
            >
              {hero.title}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
              {hero.tagline}
            </p>
            {card.tech.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center" aria-label="Technologies">
                {card.tech.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Body sections ────────────────────────────────────────── */}
      {sections.map((section: ProjectSectionData) => {
        const headingId = `${slug}-${section.id}-heading`;

        if (section.diagram) {
          return (
            <section key={section.id} aria-labelledby={headingId}>
              <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle
                    id={headingId}
                    className="text-lg md:text-2xl font-bold text-foreground"
                  >
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.body && (
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      {section.body}
                    </p>
                  )}
                  <img
                    src={section.diagram}
                    alt={`${section.title} diagram`}
                    className="w-full rounded-lg border border-border"
                    loading="lazy"
                  />
                </CardContent>
              </Card>
            </section>
          );
        }

        return (
          <section key={section.id} aria-labelledby={headingId}>
            <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle
                  id={headingId}
                  className="text-lg md:text-2xl font-bold text-foreground"
                >
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base whitespace-pre-line">
                  {section.body}
                </p>
              </CardContent>
            </Card>
          </section>
        );
      })}

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
                    <tr key={row.layer}>
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
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">
                      Service
                    </th>
                    <th className="text-right py-2 text-muted-foreground font-medium">
                      USD / month
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {costs.map((row) => (
                    <tr key={row.service}>
                      <td className="py-2 pr-4 text-foreground">{row.service}</td>
                      <td className="py-2 text-right font-mono text-xs text-foreground">
                        ${row.monthly_usd.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <ul className="space-y-4">
                {decisions.map((d) => (
                  <li key={d.title} className="border-l-2 border-primary/40 pl-4">
                    <a
                      href={d.spec}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:underline text-sm"
                    >
                      {d.title}
                    </a>
                    <p className="text-muted-foreground text-xs mt-1">{d.rationale}</p>
                  </li>
                ))}
              </ul>
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
