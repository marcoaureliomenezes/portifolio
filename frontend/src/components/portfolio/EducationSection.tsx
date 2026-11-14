import { SectionHeading } from "./SectionHeading";
import type { ContentData } from "@/types/content";

interface EducationSectionProps {
  content: ContentData;
}

export function EducationSection({ content }: EducationSectionProps) {
  const edu = content.education;

  return (
    <section
      id="educacao"
      aria-labelledby="educacao-heading"
      className="flex flex-col gap-4 motion-safe:animate-fade-up"
    >
      <SectionHeading id="educacao-heading">{content.educationTitle}</SectionHeading>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-base md:text-xl font-semibold text-foreground">
            {edu.degreeLevel} {edu.degreeField}
          </h3>
          <span className="font-mono text-sm text-muted-foreground">{edu.period}</span>
        </div>
        <p className="text-[15px] text-muted-foreground">{edu.institution}</p>
        <p className="text-[15px] text-muted-foreground">
          <span className="font-semibold text-foreground">{edu.courseworkLabel}:</span>{" "}
          {edu.coursework}
        </p>
        <p className="text-[15px] text-muted-foreground">
          <span className="font-semibold text-foreground">{edu.thesisLabel}:</span>{" "}
          {edu.thesisLink ? (
            <a
              href={edu.thesisLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-[3px] hover:text-muted-foreground"
            >
              {edu.thesis}
            </a>
          ) : (
            edu.thesis
          )}
        </p>
      </div>
    </section>
  );
}
