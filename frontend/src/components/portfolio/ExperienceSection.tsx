import { yearRange } from "@/lib/formatPeriod";
import { ExperienceCard } from "./ExperienceCard";
import { SectionHeading } from "./SectionHeading";
import type { ContentData, SupportedLanguages } from "@/types/content";

interface ExperienceSectionProps {
  content: ContentData;
  locale: SupportedLanguages;
}

/** Experience: the main employers as lines, then one Earlier line for the minor ones. */
export function ExperienceSection({ content, locale }: ExperienceSectionProps) {
  const earlier = content.experiences
    .filter(e => e.type === "minor")
    .map(e => `${e.roles[0].title}, ${e.company} (${yearRange(e.totalPeriod)})`)
    .join(" · ");

  return (
    <section
      id="experiencia"
      aria-labelledby="experiencia-heading"
      className="motion-safe:animate-fade-up space-y-6"
    >
      <SectionHeading id="experiencia-heading">{content.experienceTitle}</SectionHeading>
      {content.experiences
        .filter(e => e.type === "main")
        .map((experience, idx) => (
          <ExperienceCard key={idx} experience={experience} labels={content} locale={locale} />
        ))}
      {earlier && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{content.earlierLabel}</span>: {earlier}
        </p>
      )}
    </section>
  );
}
