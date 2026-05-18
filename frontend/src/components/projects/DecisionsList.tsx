/**
 * DecisionsList.tsx — T-PC-C-02
 *
 * Renders `decisions: ArchDecision[]` as a list of entries.
 * Each entry's title is an h3 linking to `decision.spec` (external).
 * Returns null when decisions is empty.
 *
 * Security: external links carry rel="noopener noreferrer" + target="_blank".
 */

import type { ArchDecision } from "@/types/content";

interface DecisionsListProps {
  decisions: ArchDecision[];
}

export function DecisionsList({ decisions }: DecisionsListProps) {
  if (decisions.length === 0) return null;

  return (
    <ul className="space-y-4">
      {decisions.map((d) => (
        <li key={d.title} className="border-l-2 border-primary/40 pl-4">
          <h3 className="font-semibold text-sm text-foreground">
            <a
              href={d.spec}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {d.title}
            </a>
          </h3>
          <p className="text-muted-foreground text-xs mt-1">{d.rationale}</p>
        </li>
      ))}
    </ul>
  );
}
