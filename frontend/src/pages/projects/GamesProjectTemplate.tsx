import { Card, CardContent } from "@/components/ui/card";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { ProjectHero } from "@/components/projects/ProjectHero";
import { GameCard } from "@/components/projects/GameCard";
import type { GamesProject } from "@/types/content";

/**
 * GamesProjectTemplate — T-PC-B-03 / T-PC-C-02 (refactor)
 *
 * Renders a games project page with a hero + grid of GameCard components.
 * Accepts only `GamesProject` (narrow type); discrimination upstream in `ProjectDetailPage`.
 *
 * Key rules (QA contract C-08 / AC-PC-12):
 *  - Renders exactly project.items.length game cards — no iframes, ever.
 *  - Each play link has target="_blank" rel="noopener noreferrer" (delegated to GameCard).
 *
 * SEO: managed via `useDocumentSeo` — no imperative useEffect allowed (AC-PC-11).
 */
export function GamesProjectTemplate({ project }: { project: GamesProject }) {
  useDocumentSeo({
    title: project.seo.title,
    description: project.seo.description,
  });

  const { slug, items } = project;

  return (
    <main
      className="container mx-auto px-4 pt-36 md:pt-32 pb-12 space-y-10 max-w-4xl"
      aria-label={project.seo.title}
    >
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <ProjectHero project={project} />

      {/* ── Game cards grid ───────────────────────────────────────── */}
      {items.length > 0 && (
        <section aria-label="Game list">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <GameCard key={item.slug} game={item} />
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
