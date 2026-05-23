import { MapPin, Calendar } from "lucide-react";
import { RoleCollapsible } from "./RoleCollapsible";
import type { Experience, ContentData } from "@/types/content";

interface ExperienceCardProps {
  experience: Experience;
  labels: Pick<ContentData, "responsibilities" | "technologies" | "careerProgression" | "roleSingular" | "rolePlural">;
}

export function ExperienceCard({ experience, labels }: ExperienceCardProps) {
  return (
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />

      <div className="pl-6 md:pl-8 space-y-4 relative">
        <div className="bg-card rounded-xl p-4 border border-border/50 relative motion-safe:transition-all motion-safe:duration-200 hover:shadow-medium hover:border-accent/40">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <h3 className="text-base md:text-xl font-bold text-foreground">
                {experience.fullName}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  <Calendar className="w-3 h-3 text-green-600" />
                  {experience.totalPeriod}
                </span>
                <span className="inline-flex items-center gap-1 min-w-0">
                  <MapPin className="w-3 h-3 flex-shrink-0 text-red-600" />
                  <span className="truncate">{experience.location}</span>
                </span>
              </div>
            </div>
            <div className="text-xs md:text-sm text-muted-foreground font-medium md:text-right">
              {labels.careerProgression} ({experience.roles.length}{" "}
              {experience.roles.length === 1 ? labels.roleSingular : labels.rolePlural})
            </div>
          </div>
        </div>

        {experience.roles.map((role, posIndex) => (
          <RoleCollapsible
            key={posIndex}
            role={role}
            labels={labels}
          />
        ))}
      </div>
    </div>
  );
}
