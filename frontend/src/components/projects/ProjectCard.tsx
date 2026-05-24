/**
 * ProjectCard.tsx — T-PC-C-02 (partial: ProjectCard only)
 *
 * Renders a clickable card for a single project from the discriminated union.
 * Wraps all content in a React Router <Link> to /projetos/:slug.
 *
 * Cover image: uses a Tailwind gradient placeholder when card.cover is absent.
 * T-PC-C-06 will replace the placeholder with real cover images — do not attempt
 * to load covers here; assets are not yet available.
 *
 * Accessibility:
 * - The <Link> element is the only interactive element in the card (no nested buttons).
 * - focus-visible:ring-2 applied directly on the link for keyboard navigation.
 * - aria-label on the link combines title for screen readers.
 */

import { Link } from "react-router-dom";
import type { Project } from "@/types/content";
import { track } from "@dadaia/analytics-sdk";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { slug, hero, card } = project;

  return (
    <Link
      to={`/projetos/${slug}`}
      aria-label={hero.title}
      data-testid="project-card"
      onClick={() => track('project_cta', { project: hero.title })}
      className={[
        "group block rounded-xl border border-border/40 bg-card shadow-sm",
        "overflow-hidden transition-shadow duration-200",
        "hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
      ].join(" ")}
    >
      {/* Cover area — gradient placeholder until T-PC-C-06 drops real assets */}
      <div
        data-testid="card-cover-placeholder"
        className={[
          "w-full aspect-video",
          // Gradient placeholder — T-PC-C-06 will replace this with a real cover image
          card.cover
            ? "bg-muted"
            : "bg-gradient-to-br from-primary/20 to-accent/20",
        ].join(" ")}
        aria-hidden="true"
      >
        {card.cover && (
          <img
            src={card.cover}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      {/* Card body */}
      <div className="p-4 space-y-2">
        <h3 data-testid="project-card-title" className="text-base font-semibold text-foreground leading-snug group-hover:text-accent transition-colors">
          {hero.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {card.summary}
        </p>
      </div>
    </Link>
  );
}
