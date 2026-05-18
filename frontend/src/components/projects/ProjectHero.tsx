/**
 * ProjectHero.tsx — T-PC-C-02
 *
 * Hero block per project: title (h1), tagline, tech badges, optional cover image.
 * Uses aspect-video for CLS = 0. Gradient placeholder when cover is absent —
 * T-PC-C-06 will bring real cover assets.
 *
 * Accessibility:
 * - h1 carries the page-level heading (callers must not render another h1).
 * - Cover image has alt="" (decorative) — semantics are in the h1.
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Project } from "@/types/content";

interface ProjectHeroProps {
  project: Project;
}

export function ProjectHero({ project }: ProjectHeroProps) {
  const { slug, hero, card } = project;

  return (
    <section aria-labelledby={`${slug}-hero-heading`}>
      <Card className="w-full shadow-glow border-0 bg-gradient-to-br from-card to-accent/30 hover:shadow-large transition-all duration-300">
        <CardContent className="pt-8 pb-6 flex flex-col items-center text-center gap-4">
          {/* Cover area — gradient placeholder until T-PC-C-06 drops real assets */}
          {card.cover ? (
            <div
              data-testid="hero-cover-placeholder"
              className="w-full aspect-video rounded-lg overflow-hidden bg-muted"
            >
              <img
                src={card.cover}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div
              data-testid="hero-cover-placeholder"
              className="w-full aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-accent/20"
              aria-hidden="true"
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
          {card.tech.length > 0 && (
            <div
              className="flex flex-wrap gap-2 justify-center"
              aria-label="Technologies"
            >
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
  );
}
