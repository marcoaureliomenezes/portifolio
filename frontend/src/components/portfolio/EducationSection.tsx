import { GraduationCap, Calendar } from "lucide-react";
import { MobileCollapsibleSection } from "./MobileCollapsibleSection";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";
import type { ContentData } from "@/types/content";

interface EducationSectionProps {
  content: ContentData;
}

export function EducationSection({ content }: EducationSectionProps) {
  const { ref, inView } = useInView<HTMLElement>();
  const edu = content.education;

  return (
    <section
      id="educacao"
      aria-labelledby="educacao-heading"
      ref={ref}
      className={cn("opacity-0", inView && "opacity-100 motion-safe:animate-fade-up")}
    >
      <MobileCollapsibleSection
        title={content.educationTitle}
        icon={GraduationCap}
        iconColor="text-green-500"
        headingId="educacao-heading"
        defaultOpen={true}
      >
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />
          <div className="pl-6 md:pl-8">
            <div className="bg-card rounded-xl p-4 border border-border/50 motion-safe:transition-all motion-safe:duration-200 hover:shadow-medium hover:border-accent/40">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base md:text-xl font-bold text-foreground">
                  {edu.degreeLevel}
                </h3>
                <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                  {edu.location}
                </span>
              </div>

              <p className="text-sm text-accent font-semibold mt-1">{edu.degreeField}</p>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                  {edu.institution}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  <Calendar className="w-3 h-3 flex-shrink-0 text-green-600" aria-hidden="true" />
                  {edu.period}
                </span>
              </div>

              <p className="text-sm text-foreground mt-3">
                <span className="font-bold">{edu.courseworkLabel}:</span>{" "}
                {edu.coursework}
              </p>

              <p className="text-sm text-foreground mt-1">
                <span className="font-bold">{edu.thesisLabel}:</span>{" "}
                {edu.thesisLink ? (
                  <a
                    href={edu.thesisLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    {edu.thesis}
                  </a>
                ) : (
                  edu.thesis
                )}
              </p>
            </div>
          </div>
        </div>
      </MobileCollapsibleSection>
    </section>
  );
}
