import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * A single key-value status item displayed in an info section.
 */
export interface StatusItem {
  label: string;
  value: string;
}

/**
 * A content section rendered inside the page.
 * - type "body": renders a heading + paragraph body.
 * - type "status": renders a heading + a list of key-value items.
 * - type "diagram": renders a heading + body text + an <img>.
 */
export type ProjectSection =
  | { id: string; type?: "body"; title: string; body: string }
  | { id: string; type: "status"; title: string; items: StatusItem[] }
  | { id: string; type: "diagram"; title: string; body: string; diagram: string };

/**
 * Hero block displayed at the top of every project tab page.
 */
export interface ProjectHero {
  title: string;
  tagline: string;
  /** Optional path to a logo image. */
  logo?: string;
}

/**
 * Call-to-action block shown at the bottom of every project tab page.
 */
export interface ProjectCta {
  /** URL of the primary GitHub repository. */
  github: string;
  /** Optional secondary link (e.g. internal docs). */
  docs?: string;
  /** Label overrides — defaults to "GitHub" / "Docs". */
  githubLabel?: string;
  docsLabel?: string;
}

/**
 * SEO metadata for the page.
 * Inject into <head> via react-helmet-async (T-CONTENT-02/03/04 will add the provider).
 */
export interface ProjectSeo {
  title: string;
  description: string;
}

/**
 * Full content payload consumed by ProjectTabPage.
 */
export interface ProjectTabContent {
  hero: ProjectHero;
  sections: ProjectSection[];
  cta: ProjectCta;
  seo?: ProjectSeo;
}

interface ProjectTabPageProps {
  content: ProjectTabContent;
  /** Slug used as a fallback id prefix for heading ids. */
  slug: string;
}

/**
 * Generic layout template for project tab pages (/projetos/<slug>).
 *
 * Renders: hero → body sections → CTA.
 * Concrete pages (DadaiaWorkspacePage, TauanGamesPage, ArchitecturePage) instantiate
 * this with their own content objects — no markup duplication.
 *
 * T-FE-09 delivers the template; T-CONTENT-02/03/04 wire the three concrete pages.
 */
export function ProjectTabPage({ content, slug }: ProjectTabPageProps) {
  const { hero, sections, cta, seo } = content;

  return (
    <main
      className="container mx-auto px-4 pt-36 md:pt-32 pb-12 space-y-10 max-w-4xl"
      aria-label={seo?.title ?? hero.title}
    >
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section aria-labelledby={`${slug}-hero-heading`}>
        <Card className="w-full shadow-glow border-0 bg-gradient-to-br from-card to-accent/30 hover:shadow-large transition-all duration-300">
          <CardContent className="pt-8 pb-6 flex flex-col items-center text-center gap-4">
            {hero.logo && (
              <img
                src={hero.logo}
                alt={`${hero.title} logo`}
                className="h-16 w-auto object-contain"
                loading="lazy"
              />
            )}
            <h1
              id={`${slug}-hero-heading`}
              className="text-2xl md:text-4xl font-bold text-primary"
            >
              {hero.title}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
              {hero.tagline}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ── Body sections ────────────────────────────────────────── */}
      {sections.map((section) => {
        const headingId = `${slug}-${section.id}-heading`;

        if (section.type === "status") {
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

        if (section.type === "diagram") {
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
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {section.body}
                  </p>
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

        // Default: type === "body" (or undefined)
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

      {/* ── Placeholder notice (honest gap filler until T-CONTENT-* fills real copy) ── */}
      {sections.length === 0 && (
        <section aria-labelledby={`${slug}-placeholder-heading`}>
          <Card className="w-full border border-dashed border-border bg-muted/30">
            <CardContent className="py-12 flex flex-col items-center text-center gap-4">
              <h2
                id={`${slug}-placeholder-heading`}
                className="text-lg font-semibold text-muted-foreground"
              >
                Em construcao
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                O conteudo desta pagina esta sendo preparado. Enquanto isso, confira o
                repositorio no GitHub.
              </p>
              <a
                href={cta.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline text-sm"
              >
                {cta.github}
              </a>
            </CardContent>
          </Card>
        </section>
      )}

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

            {cta.docs && (
              <Button asChild variant="outline">
                <a
                  href={cta.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  {cta.docsLabel ?? "Docs"}
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
