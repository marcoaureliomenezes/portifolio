/**
 * ProjectCard.tsx — T-PC-C-02 / T-PC2-R2-07 (redesign)
 *
 * Renders a clickable card for a single project from the discriminated union.
 * Wraps all content in a React Router <Link> to /projetos/:slug.
 *
 * rc-2 redesign (AC-PC2-R2-06): the card must "sell" in seconds —
 *  - kind chip (i18n via projectsV2.index.kindLabels, code fallback)
 *  - up to 4 tech badges
 *  - headline stat + registry hint for library projects (pip install …)
 *  - subtle hover lift on the cover
 *
 * Accessibility (unchanged contract):
 * - The <Link> is the ONLY interactive element in the card — registry/stat
 *   affordances are passive chips, never nested anchors/buttons.
 * - focus-visible:ring-2 applied directly on the link for keyboard navigation.
 * - aria-label on the link combines title for screen readers.
 */

import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/types/content";
import { track } from "@dadaia/analytics-sdk";

const KIND_FALLBACK_LABELS: Record<Project["kind"], string> = {
  "case-study": "Case study",
  meta: "Infra",
  games: "Games",
  library: "Python · PyPI",
};

interface ProjectCardProps {
  project: Project;
  /** i18n kind labels from projectsV2.index.kindLabels (optional). */
  kindLabels?: Partial<Record<Project["kind"], string>>;
}

export function ProjectCard({ project, kindLabels }: ProjectCardProps) {
  const { slug, hero, card, kind } = project;

  const kindLabel = kindLabels?.[kind] ?? KIND_FALLBACK_LABELS[kind];
  const stat = kind === "library" ? project.stat : undefined;
  const installHint = kind === "library" ? project.pypi.installCommand : undefined;

  return (
    <Link
      to={`/projetos/${slug}`}
      aria-label={hero.title}
      data-testid="project-card"
      onClick={() => track("project_cta", { project: hero.title })}
      className={[
        "group block rounded-xl border border-border/40 bg-card shadow-sm",
        "overflow-hidden transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
      ].join(" ")}
    >
      {/* Cover area with kind chip overlay */}
      <div
        data-testid="card-cover-placeholder"
        className={[
          "relative w-full aspect-video overflow-hidden",
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
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        )}
        <span
          data-testid="project-card-kind"
          className="absolute top-2 right-2 rounded-full bg-background/85 backdrop-blur px-2.5 py-0.5 text-xs font-medium text-foreground border border-border/60"
        >
          {kindLabel}
        </span>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3
            data-testid="project-card-title"
            className="text-base font-semibold text-foreground leading-snug group-hover:text-accent transition-colors"
          >
            {hero.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {card.summary}
          </p>
        </div>

        {/* Tech badges (≤ 4) — AC-PC2-R2-06 */}
        <div className="flex flex-wrap gap-1.5" data-testid="project-card-tech">
          {card.tech.slice(0, 4).map((t) => (
            <Badge key={t} variant="secondary" className="text-xs font-normal">
              {t}
            </Badge>
          ))}
        </div>

        {/* Library signal row: install hint + headline stat (passive chips) */}
        {(installHint || stat) && (
          <div className="flex items-center justify-between gap-2 text-xs">
            {installHint && (
              <code
                data-testid="project-card-install"
                className="font-mono text-muted-foreground truncate"
              >
                $ {installHint}
              </code>
            )}
            {stat && (
              <span
                data-testid="project-card-stat"
                className="shrink-0 font-semibold text-accent"
              >
                {stat.value} {stat.label}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
