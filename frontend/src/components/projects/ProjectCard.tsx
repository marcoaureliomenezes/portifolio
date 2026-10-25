/**
 * ProjectCard.tsx — a project card of four elements: still poster, name,
 * purpose, and a PyPI version line for libraries. The whole card is one
 * <Link> to /projetos/:slug, the only interactive element.
 */

import { Link } from "react-router-dom";
import type { Project } from "@/types/content";
import { track } from "@dadaia/analytics-sdk";

const COVER_SIZE = { width: 1280, height: 720 };

export function ProjectCard({ project }: { project: Project }) {
  const { slug, hero, card } = project;
  const media = hero.media?.type === "video" ? hero.media : undefined;
  const poster = media
    ? { src: media.desktop.poster, width: media.desktop.width, height: media.desktop.height, alt: media.alt }
    : card.cover && { src: card.cover, ...COVER_SIZE, alt: hero.title };

  return (
    <Link
      to={`/projetos/${slug}`}
      aria-label={hero.title}
      data-testid="project-card"
      onClick={() => track("project_cta", { project: hero.title })}
      className={[
        "block rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
      ].join(" ")}
    >
      <div
        data-testid="card-cover-placeholder"
        className={[
          "w-full aspect-video overflow-hidden",
          poster ? "bg-muted" : "bg-gradient-to-br from-primary/20 to-accent/20",
        ].join(" ")}
      >
        {poster && (
          <img {...poster} className="w-full h-full object-cover" loading="lazy" />
        )}
      </div>
      <div className="p-4 space-y-1">
        <h3 data-testid="project-card-title" className="text-item text-foreground">
          {hero.title}
        </h3>
        <p className="text-meta text-muted-foreground line-clamp-2">{card.summary}</p>
        {project.kind === "library" && (
          <p className="font-mono text-meta text-muted-foreground">PyPI {project.pypi.version}</p>
        )}
      </div>
    </Link>
  );
}
