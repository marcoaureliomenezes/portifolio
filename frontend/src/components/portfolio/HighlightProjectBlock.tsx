import type { HighlightProject } from "@/types/content";

interface HighlightProjectBlockProps {
  highlight: HighlightProject;
}

/**
 * HighlightProjectBlock — T-FE-WAVE6
 *
 * Renders the "highlight project" block for a role, using the design tokens
 * established in F-P0-07: bg-accent-subtle, border-accent, rounded-xl, p-5.
 *
 * A11y: the impact badge includes aria-label="Impacto" because the leading
 * emoji is not sufficient for screen readers alone.
 */
export function HighlightProjectBlock({ highlight }: HighlightProjectBlockProps) {
  return (
    <div className="bg-accent-subtle border border-accent rounded-xl p-5 space-y-3">
      {/* Header row: impact badge + title */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="inline-flex items-center rounded-full bg-accent text-accent-foreground px-2.5 py-1 text-xs font-semibold"
          aria-label="Impacto"
        >
          ⚡ Impacto
        </span>
        <h5 className="font-bold text-lg text-foreground">
          {highlight.title}
        </h5>
      </div>

      {/* Body */}
      <p className="text-foreground text-sm leading-relaxed">
        {highlight.body}
      </p>

      {/* Impact metrics */}
      {highlight.impact && highlight.impact.length > 0 && (
        <ul className="space-y-1">
          {highlight.impact.map((item, idx) => (
            <li key={idx} className="font-mono text-sm text-foreground">
              {item}
            </li>
          ))}
        </ul>
      )}

      {/* Optional links */}
      {highlight.links && highlight.links.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {highlight.links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-accent/50 bg-transparent px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent/10 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
