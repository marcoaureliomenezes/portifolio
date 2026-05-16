import type { HighlightProject } from "@/types/content";

interface HighlightProjectBlockProps {
  highlight: HighlightProject;
}

export function HighlightProjectBlock({ highlight }: HighlightProjectBlockProps) {
  const titleId = "highlight-project-title";

  return (
    <div
      role="region"
      aria-labelledby={titleId}
      className="rounded-xl border border-accent bg-accent-subtle p-5 md:p-6 mt-4"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span
          aria-label="Impacto"
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-accent text-accent-foreground"
        >
          ⚡ Impacto
        </span>
        <h4
          id={titleId}
          className="font-bold text-lg text-foreground"
        >
          {highlight.title}
        </h4>
      </div>

      {/* Body */}
      <p className="text-foreground/90 leading-relaxed text-sm mb-3">
        {highlight.body}
      </p>

      {/* Impact metrics */}
      {highlight.impact && highlight.impact.length > 0 && (
        <ul className="space-y-1 mb-3">
          {highlight.impact.map((item, idx) => (
            <li
              key={idx}
              className="font-mono text-sm text-foreground/80"
            >
              {item}
            </li>
          ))}
        </ul>
      )}

      {/* Links */}
      {highlight.links && highlight.links.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {highlight.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-accent px-3 py-1 text-xs font-semibold text-foreground hover:bg-accent/10 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
