import { ExternalLink, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import type { GamesProject, GameLink } from "@/types/content";

/**
 * GamesProjectTemplate — T-PC-B-03
 *
 * Renders a games project page with a hero + grid of game cards.
 * Accepts only `GamesProject` (narrow type); discrimination upstream in `ProjectDetailPage`.
 *
 * Key rules (QA contract C-08 / AC-PC-12):
 *  - Renders exactly project.items.length game cards — no iframes, ever.
 *  - Each play link has target="_blank" rel="noopener noreferrer".
 *
 * SEO: managed via `useDocumentSeo` — no imperative useEffect allowed (AC-PC-11).
 */
export function GamesProjectTemplate({ project }: { project: GamesProject }) {
  useDocumentSeo({
    title: project.seo.title,
    description: project.seo.description,
  });

  const { slug, hero, card, items } = project;

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

      {/* ── Game cards grid ───────────────────────────────────────── */}
      {items.length > 0 && (
        <section aria-label="Game list">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item: GameLink) => (
              <Card
                key={item.slug}
                className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300 flex flex-col"
              >
                {item.cover && (
                  <div className="overflow-hidden rounded-t-lg aspect-video">
                    <img
                      src={item.cover}
                      alt={`${item.title} screenshot`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-bold text-foreground">
                      {item.title}
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {item.engine}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 flex-1">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.body}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-auto">
                    {/* Play link — primary CTA (AC-PC-12: no iframe, use link) */}
                    <a
                      href={item.playUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline"
                      aria-label={`Play ${item.title}`}
                    >
                      <Play className="w-4 h-4" aria-hidden="true" />
                      Play
                    </a>
                    {/* GitHub link — secondary CTA */}
                    <a
                      href={item.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium hover:underline"
                      aria-label={`View ${item.title} on GitHub`}
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      GitHub
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ── Empty state ───────────────────────────────────────────── */}
      {items.length === 0 && (
        <section aria-labelledby={`${slug}-empty-heading`}>
          <Card className="w-full border border-dashed border-border bg-muted/30">
            <CardContent className="py-12 flex flex-col items-center text-center gap-4">
              <h2
                id={`${slug}-empty-heading`}
                className="text-lg font-semibold text-muted-foreground"
              >
                Em breve
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Os jogos estao sendo preparados. Confira o repositorio no GitHub.
              </p>
              <a
                href="https://github.com/marcoaureliomenezes/tauan-games"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline text-sm"
              >
                github.com/marcoaureliomenezes/tauan-games
              </a>
            </CardContent>
          </Card>
        </section>
      )}
    </main>
  );
}
