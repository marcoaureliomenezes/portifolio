import { formatPeriod } from "@/lib/formatPeriod";
import { RoleCollapsible } from "./RoleCollapsible";
import type { Experience, ContentData, SupportedLanguages } from "@/types/content";

interface ExperienceCardProps {
  experience: Experience;
  labels: Pick<ContentData, "responsibilities" | "technologies" | "detailsOpen" | "detailsClose" | "impactLabel">;
  locale: SupportedLanguages;
}

/** One employer: a single h3 line (company, period, location) over its roles, under a left rule. */
export function ExperienceCard({ experience, labels, locale }: ExperienceCardProps) {
  return (
    <div className="border-l-2 border-border pl-4 md:pl-6 space-y-3">
      <h3 className="flex flex-wrap items-baseline gap-x-3 text-base md:text-lg font-bold text-foreground">
        <span>{experience.fullName}</span>
        <span className="font-mono text-xs font-normal text-muted-foreground">
          {formatPeriod(experience.totalPeriod, locale)}
        </span>
        <span className="text-xs font-normal text-muted-foreground">{experience.location}</span>
      </h3>
      {experience.roles.map((role, idx) => (
        <RoleCollapsible
          key={idx}
          role={{ ...role, period: formatPeriod(role.period, locale) }}
          labels={labels}
        />
      ))}
    </div>
  );
}
