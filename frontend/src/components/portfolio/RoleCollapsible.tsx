import { useState } from "react";
import { formatPeriod } from "@/lib/formatPeriod";
import {
  Disclosure,
  DisclosureTrigger,
  DisclosureContent,
} from "@/components/ui/disclosure";
import { RoleSkillBadges } from "./RoleSkillBadges";
import { HighlightProjectBlock } from "./HighlightProjectBlock";
import type { Position, ContentData } from "@/types/content";
import { track } from "@dadaia/analytics-sdk";

interface RoleCollapsibleProps {
  role: Position;
  /** Optional initial open state; defaults to false */
  defaultOpen?: boolean;
  labels: Pick<ContentData, "responsibilities" | "technologies">;
}

/**
 * One role inside an experience.
 *
 * T-RD-03/T-RD-08 redesign: shared Disclosure primitive; summary = the FIRST
 * responsibility only (the old 3-bullets-joined teaser ellipsized mid-sentence);
 * flat card (ornamental gradients removed — the timeline rail on ExperienceCard
 * is the section's single motif); metadata (period) in mono per the type scale.
 */
export function RoleCollapsible({ role, labels, defaultOpen = false }: RoleCollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const summary = role.responsibilities?.[0];

  // T-AN-D-02: Track section expand/collapse analytics events.
  function handleOpenChange(next: boolean) {
    setOpen(next);
    track(next ? "section_expand" : "section_collapse", { section: role.title });
  }

  return (
    <Disclosure open={open} onOpenChange={handleOpenChange}>
      <div className="bg-card rounded-xl border border-border/40 overflow-hidden hover:border-accent/40 transition-colors duration-200">
        <DisclosureTrigger className="p-3 md:p-4 rounded-xl">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <h4 className="font-bold text-foreground text-sm md:text-base">
                {role.title}
              </h4>
              <span className="font-mono text-xs text-muted-foreground">
                {formatPeriod(role.period)}
              </span>
            </div>
            {summary && !open && (
              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                {summary}
              </p>
            )}
          </div>
        </DisclosureTrigger>

        <DisclosureContent>
          <div className="px-3 md:px-4 pb-4 space-y-4">
            {role.responsibilities && (
              <ul className="space-y-1.5 pt-1">
                {role.responsibilities.map((responsibility, idx) => (
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
              <HighlightProjectBlock highlight={role.highlightProject} />
            )}
          </div>
        </DisclosureContent>
      </div>
    </Disclosure>
  );
}
