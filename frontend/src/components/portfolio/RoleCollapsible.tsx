import { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, Award, ExternalLink } from "lucide-react";
import { formatPeriod } from "@/lib/formatPeriod";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

export function RoleCollapsible({ role, labels, defaultOpen = false }: RoleCollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const teaser = role.responsibilities?.slice(0, 3).join(" ");

  // T-AN-D-02: Track section expand/collapse analytics events.
  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      track('section_expand', { section: role.title });
    } else {
      track('section_collapse', { section: role.title });
    }
  }

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange}>
      <div className="bg-gradient-to-br from-card to-accent/5 rounded-xl border border-border/30 overflow-hidden hover:border-primary/30 transition-all duration-200 shadow-soft hover:shadow-medium ml-6 relative">
        <div className="absolute -left-6 top-1/2 w-6 h-0.5 border-t-2 border-dotted border-primary/40" />
        <div className="absolute -left-7 top-1/2 w-2 h-2 bg-primary rounded-full transform -translate-y-1/2" />
        <CollapsibleTrigger className="w-full p-4 md:p-5 text-left hover:bg-accent/5 transition-colors duration-200">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 w-full">
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-foreground text-sm md:text-lg truncate">
                  {role.title}
                </h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-green-600 flex-shrink-0" />
                  <p className="text-primary font-semibold text-xs md:text-sm">
                    {formatPeriod(role.period)}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-primary flex-shrink-0">
                {open ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>
            {teaser && (
              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {teaser}
              </p>
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="px-4 md:px-6 pb-6 space-y-4">
          {role.responsibilities && (
            <div className="space-y-3 pt-2">
              <h5 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-600" />
                {labels.responsibilities}
              </h5>
              <ul className="space-y-2 pl-2">
                {role.responsibilities.map((responsibility, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-foreground text-sm leading-relaxed">
                      {responsibility}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {role.technologies && (
            <div className="pt-4 border-t border-border/30">
              <h5 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                {labels.technologies}
              </h5>
              <div className="bg-gradient-to-r from-accent/20 to-secondary/20 rounded-lg p-4 border border-primary/20">
                <p className="text-foreground font-medium text-sm leading-relaxed">
                  {role.technologies}
                </p>
              </div>
            </div>
          )}

          {role.skills && role.skills.length > 0 && (
            <div className="pt-4">
              <RoleSkillBadges skills={role.skills} />
            </div>
          )}

          {role.highlightProject && (
            <div className="pt-4">
              <HighlightProjectBlock highlight={role.highlightProject} />
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
