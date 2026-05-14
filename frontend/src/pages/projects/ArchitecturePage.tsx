import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { useContent } from "@/hooks/useContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * ArchitecturePage — T-CONTENT-04
 *
 * Meta-page explaining how this portfolio is built: stack, infra, costs,
 * architecture decisions, and links.
 *
 * Route: /projetos/portifolio
 */
export function ArchitecturePage() {
  const { content } = useContent();
  const project = content.projects?.["portifolio"];

  const hero = project?.hero ?? {
    title: "Portfolio Architecture",
    tagline: "How this site is built, hosted, and maintained.",
  };

  const seo = project?.seo ?? {
    title: "Portfolio Architecture — Marco Menezes",
    description:
      "Stack, terraform infra, monthly costs and architectural decisions for marco-menezes.com.",
  };

  const stack = project?.stack ?? [];
  const costs = project?.costs ?? [];
  const decisions = project?.decisions ?? [];
  const links = project?.links ?? {
    repo: "https://github.com/marcoaureliomenezes/portifolio",
    terraform:
      "https://github.com/marcoaureliomenezes/portifolio/tree/main/terraform",
    specs: "https://github.com/marcoaureliomenezes/portifolio/tree/main/specs",
  };
  const diagram = project?.diagram ?? "/assets/projects/portifolio/architecture.svg";

  useEffect(() => {
    document.title = seo.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", seo.description);
    } else {
      const tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      tag.setAttribute("content", seo.description);
      document.head.appendChild(tag);
    }
    const metaOgTitle = document.querySelector('meta[property="og:title"]');
    if (metaOgTitle) {
      metaOgTitle.setAttribute("content", seo.title);
    }
    const metaOgDesc = document.querySelector('meta[property="og:description"]');
    if (metaOgDesc) {
      metaOgDesc.setAttribute("content", seo.description);
    }
  }, [seo.title, seo.description]);

  return (
    <main
      className="container mx-auto px-4 pt-36 md:pt-32 pb-12 space-y-10 max-w-4xl"
      aria-label={seo.title}
    >
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section aria-labelledby="portifolio-hero-heading">
        <Card className="w-full shadow-glow border-0 bg-gradient-to-br from-card to-accent/30 hover:shadow-large transition-all duration-300">
          <CardContent className="pt-8 pb-6 flex flex-col items-center text-center gap-4">
            <h1
              id="portifolio-hero-heading"
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

      {/* ── Diagram ──────────────────────────────────────────────── */}
      <section aria-labelledby="portifolio-diagram-heading">
        <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle
              id="portifolio-diagram-heading"
              className="text-lg md:text-2xl font-bold text-foreground"
            >
              Infrastructure Diagram
            </CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={diagram}
              alt="Portfolio infrastructure architecture diagram"
              className="w-full rounded-lg border border-border"
              loading="lazy"
            />
          </CardContent>
        </Card>
      </section>

      {/* ── Stack table ──────────────────────────────────────────── */}
      {stack.length > 0 && (
        <section aria-labelledby="portifolio-stack-heading">
          <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle
                id="portifolio-stack-heading"
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
                      <td className="py-2 text-foreground font-mono text-xs">
                        {row.tech}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>
      )}

      {/* ── Cost table ───────────────────────────────────────────── */}
      {costs.length > 0 && (
        <section aria-labelledby="portifolio-costs-heading">
          <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle
                id="portifolio-costs-heading"
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

      {/* ── Architectural decisions ───────────────────────────────── */}
      {decisions.length > 0 && (
        <section aria-labelledby="portifolio-decisions-heading">
          <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle
                id="portifolio-decisions-heading"
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
      <section aria-labelledby="portifolio-links-heading">
        <Card className="w-full shadow-medium border-0 bg-card">
          <CardHeader className="pb-2">
            <CardTitle
              id="portifolio-links-heading"
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
