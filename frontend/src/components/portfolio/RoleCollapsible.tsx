import { useState } from "react";
import { PROSE } from "@/lib/layout";
import { Disclosure, DisclosureContent } from "@/components/ui/disclosure";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { RoleSkillBadges } from "./RoleSkillBadges";
import { HighlightProjectBlock } from "./HighlightProjectBlock";
import type { Position, ContentData } from "@/types/content";
import { track } from "@dadaia/analytics-sdk";

interface RoleCollapsibleProps {
  role: Position;
  /** Optional initial open state; defaults to false */
  defaultOpen?: boolean;
  labels: Pick<ContentData, "responsibilities" | "technologies" | "detailsOpen" | "detailsClose" | "impactLabel">;
}

/**
 * One role inside an experience.
 *
 * An article: title, period as given, the first responsibility as an unclamped
 * summary, and one Details button that discloses the rest.
 */
export function RoleCollapsible({ role, labels, defaultOpen = false }: RoleCollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const summary = role.responsibilities?.[0];
  const rest = role.responsibilities?.slice(1) ?? [];

  // T-AN-D-02: Track section expand/collapse analytics events.
  function handleOpenChange(next: boolean) {
    setOpen(next);
    track(next ? "section_expand" : "section_collapse", { section: role.title });
  }

  return (
    <Disclosure open={open} onOpenChange={handleOpenChange}>
      <article
        data-testid="role"
        className="flex flex-col space-y-1"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <h4 className="font-bold text-foreground text-sm md:text-base">{role.title}</h4>
          <span className="font-mono text-xs text-muted-foreground">{role.period}</span>
        </div>
        {summary && (
          <p className={`${PROSE} text-sm leading-relaxed text-muted-foreground`}>{summary}</p>
        )}
        <CollapsibleTrigger className="self-start font-mono text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
          {open ? labels.detailsClose : labels.detailsOpen}
        </CollapsibleTrigger>

        <DisclosureContent>
          <div className="pb-1 space-y-4">
            {rest.length > 0 && (
              <ul className="space-y-1.5 pt-1">
                {rest.map((responsibility, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span
                      className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <p className="text-foreground text-sm leading-relaxed">
                      {responsibility}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {role.technologies && (
              <div className="pt-3 border-t border-border/40">
                <p className="text-sm leading-relaxed">
                  <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground mr-2">
                    {labels.technologies}
                  </span>
                  <span className="text-foreground">{role.technologies}</span>
                </p>
              </div>
            )}

            {role.skills && role.skills.length > 0 && (
              <RoleSkillBadges skills={role.skills} />
            )}

            {role.highlightProject && (
              <HighlightProjectBlock highlight={role.highlightProject} impactLabel={labels.impactLabel} />
            )}
          </div>
        </DisclosureContent>
      </article>
    </Disclosure>
  );
}
