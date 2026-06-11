import { ExternalLink, Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Certification } from "@/types/content";

interface CertificationCardProps {
  cert: Certification;
}

/**
 * Compact certification tile — T-RD-07 (AC-RD-05).
 *
 * Grid cell (was a full-width ~166px row that was ~60% whitespace): badge,
 * 2-line name, level chip + mono date. The WHOLE tile is the credential link
 * (single interactive element — no nested button), with an external-link
 * affordance that appears on hover.
 */
export function CertificationCard({ cert }: CertificationCardProps) {
  const hasLink = Boolean(cert.link && cert.link !== "#");

  const body = (
    <>
      {/* Fixed icon box: badges come in many shapes (hexagon/rect/circle) —
          a uniform 48px anchor keeps every tile's text column aligned. */}
      <span
        className="w-12 h-12 flex-shrink-0 rounded-lg bg-muted/40 flex items-center justify-center p-1.5"
        aria-hidden="true"
      >
        {cert.icon ? (
          <img
            src={cert.icon}
            alt=""
            loading="lazy"
            decoding="async"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <Medal className="w-7 h-7 text-muted-foreground" />
        )}
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <h4 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
          {cert.name}
        </h4>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="text-xs font-normal">
            {cert.level}
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">
            {cert.date}
          </span>
        </div>
      </div>
      {hasLink && (
        <ExternalLink
          aria-hidden="true"
          className="w-4 h-4 flex-shrink-0 text-muted-foreground opacity-0 group-hover/cert:opacity-100 group-focus-visible/cert:opacity-100 transition-opacity"
        />
      )}
    </>
  );

  const tileClasses =
    "group/cert flex items-center gap-3 p-2.5 bg-card rounded-xl border border-border/40 h-full min-h-[68px]";

  if (!hasLink) {
    return (
      <div data-testid="cert-tile" className={tileClasses}>
        {body}
      </div>
    );
  }

  return (
    <a
      href={cert.link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={cert.name}
      data-testid="cert-tile"
      className={`${tileClasses} hover:border-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
    >
      {body}
    </a>
  );
}
