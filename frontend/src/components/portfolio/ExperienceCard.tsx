import { MapPin, Calendar, Award, ExternalLink } from "lucide-react";
import { RoleCollapsible } from "./RoleCollapsible";
import type { Experience, ContentData } from "@/types/content";

interface ExperienceCardProps {
  experience: Experience;
  labels: Pick<ContentData, "responsibilities" | "technologies">;
}

export function ExperienceCard({ experience, labels }: ExperienceCardProps) {
  const isSingleRole = experience.roles.length === 1;

  return (
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />

      {isSingleRole ? (
        <div className="bg-card rounded-xl p-4 border border-border/50 relative motion-safe:transition-all motion-safe:duration-200 hover:-translate-y-1 hover:shadow-large hover:border-accent/40">
          <h3 className="text-xs md:text-xl font-bold text-foreground mb-2 md:whitespace-normal whitespace-nowrap overflow-hidden text-ellipsis">
            {experience.fullName}
          </h3>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-primary text-sm md:text-lg">
              {experience.roles[0].title}
            </h4>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
              <p className="text-primary font-semibold text-xs md:text-sm">
                {experience.roles[0].period}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-1 text-muted-foreground text-xs mb-4">
            <MapPin className="w-3 h-3 flex-shrink-0 text-red-600" />
            <span className="truncate">{experience.location}</span>
          </div>

          {experience.roles[0].responsibilities && (
            <div className="space-y-3 pt-2">
              <h5 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-600" />
                {labels.responsibilities}
              </h5>
              <ul className="space-y-2 pl-2">
                {experience.roles[0].responsibilities.map((r, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-foreground text-sm leading-relaxed">{r}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {experience.roles[0].technologies && (
            <div className="pt-4 border-t border-border/30">
              <h5 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                {labels.technologies}
              </h5>
              <div className="bg-gradient-to-r from-accent/20 to-secondary/20 rounded-lg p-4 border border-primary/20">
                <p className="text-foreground font-medium text-sm leading-relaxed">
                  {experience.roles[0].technologies}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="pl-8 space-y-6 relative">
          <div className="absolute left-4 top-20 bottom-4 w-0.5 border-l-2 border-dotted border-primary/40" />
          <div className="bg-card rounded-xl p-4 border border-border/50 relative motion-safe:transition-all motion-safe:duration-200 hover:-translate-y-1 hover:shadow-large hover:border-accent/40">
            <h3 className="text-xs md:text-xl font-bold text-foreground mb-2 md:whitespace-normal whitespace-nowrap overflow-hidden text-ellipsis">
              {experience.fullName}
            </h3>
            <div className="flex items-center gap-3 text-sm mb-3">
              <p className="text-primary font-semibold text-xs whitespace-nowrap overflow-hidden text-ellipsis flex-shrink-0">
                {experience.totalPeriod}
              </p>
              <span className="text-muted-foreground flex-shrink-0">|</span>
              <div className="flex items-center gap-1 text-muted-foreground text-xs min-w-0">
                <MapPin className="w-3 h-3 flex-shrink-0 text-red-600" />
                <span className="truncate">{experience.location}</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Progressão de carreira ({experience.roles.length}{" "}
              {experience.roles.length === 1 ? "cargo" : "cargos"}):
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
      )}
    </div>
  );
}
