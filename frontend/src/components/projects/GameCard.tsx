/**
 * GameCard.tsx — T-PC-C-02
 *
 * Renders one GameLink from GamesProject.items[].
 * External playUrl → <a target="_blank" rel="noopener noreferrer">.
 * Cover: gradient placeholder when cover is an empty string — T-PC-C-06 drops real assets.
 *
 * Accessibility:
 * - Cover image has descriptive alt (title + "screenshot").
 * - Play and GitHub links have aria-label.
 *
 * Security (OWASP A07):
 * - All external links: rel="noopener noreferrer" + target="_blank".
 */

import { ExternalLink, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GameLink } from "@/types/content";

interface GameCardProps {
  game: GameLink;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300 flex flex-col">
      {/* Cover area */}
      {game.cover ? (
        <div className="overflow-hidden rounded-t-lg aspect-video">
          <img
            src={game.cover}
            alt={`${game.title} screenshot`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div
          data-testid="game-cover-placeholder"
          className="w-full aspect-video rounded-t-lg bg-gradient-to-br from-primary/20 to-accent/20"
          aria-hidden="true"
        />
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-bold text-foreground">
            {game.title}
          </CardTitle>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {game.engine}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 flex-1">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {game.body}
        </p>
        <div className="flex flex-wrap gap-3 mt-auto">
          {/* Play link — primary CTA */}
          <a
            href={game.playUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline"
            aria-label={`Play ${game.title}`}
          >
            <Play className="w-4 h-4" aria-hidden="true" />
            Play
          </a>
          {/* GitHub link — secondary CTA */}
          <a
            href={game.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium hover:underline"
            aria-label={`View ${game.title} on GitHub`}
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            GitHub
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
