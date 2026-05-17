import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import type { CaseStudyProject, ProjectSectionData } from "@/types/content";

/**
 * CaseStudyTemplate — T-PC-B-03
 *
 * Renders a case-study project page. Accepts only `CaseStudyProject` (narrow type);
 * discrimination happens upstream in `ProjectDetailPage`.
 *
 * Layout: hero → tech badges → body sections → GitHub CTA
 *
 * SEO: managed via `useDocumentSeo` — no imperative useEffect allowed (AC-PC-11).
 */
export function CaseStudyTemplate({ project }: { project: CaseStudyProject }) {
  useDocumentSeo({
    title: project.seo.title,
    description: project.seo.description,
  });

  const { slug, hero, card, sections, cta } = project;

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

        // Status / key-value list section
        if (section.items) {
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
                  <dl className="divide-y divide-border">
                    {section.items.map((item) => (
                      <div key={item.label} className="py-3 flex justify-between text-sm">
                        <dt className="text-muted-foreground font-medium">{item.label}</dt>
                        <dd className="text-foreground">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            </section>
          );
        }

        // Diagram section
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

        // Default: body text section
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
