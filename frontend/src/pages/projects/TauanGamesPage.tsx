import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { useContent } from "@/hooks/useContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GamesProject, GameLink } from "@/types/content";

/**
 * TauanGamesPage — T-CONTENT-03
 *
 * Concrete project tab page for `/projetos/tauan-games`.
 * Renders a hero + grid of game cards, each with:
 *   - Placeholder/screenshot image (lazy loaded)
 *   - Engine badge
 *   - Description paragraph
 *   - GitHub link (target=_blank rel="noopener noreferrer")
 */
export function TauanGamesPage() {
  const { content } = useContent();
  const project = content.projects?.list?.find((p) => p.slug === "tauan-games") as GamesProject | undefined;

  const hero = project?.hero ?? {
    title: "tauan-games",
    tagline: "Games built at home with my son Tauan.",
  };

  const items: GameLink[] = project?.items ?? [];

  const seo = project?.seo ?? {
    title: "tauan-games — Marco Menezes",
    description: "Game prototypes developed with Tauan.",
  };

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
      <section aria-labelledby="tauan-games-hero-heading">
        <Card className="w-full shadow-glow border-0 bg-gradient-to-br from-card to-accent/30 hover:shadow-large transition-all duration-300">
          <CardContent className="pt-8 pb-6 flex flex-col items-center text-center gap-4">
            <h1
              id="tauan-games-hero-heading"
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

      {/* ── Game cards grid ───────────────────────────────────────── */}
      {items.length > 0 && (
        <section aria-label="Game list">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <Card
                key={item.slug}
                className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300 flex flex-col"
              >
                <div className="overflow-hidden rounded-t-lg">
                  <img
                    src={item.cover}
                    alt={`${item.title} screenshot`}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                </div>
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
                  <a
                    href={item.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline mt-auto"
                  >
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    GitHub
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {items.length === 0 && (
        <section aria-labelledby="tauan-games-placeholder-heading">
          <Card className="w-full border border-dashed border-border bg-muted/30">
            <CardContent className="py-12 flex flex-col items-center text-center gap-4">
              <h2
                id="tauan-games-placeholder-heading"
                className="text-lg font-semibold text-muted-foreground"
              >
                Em construcao
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Os jogos serao listados aqui em breve.
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
