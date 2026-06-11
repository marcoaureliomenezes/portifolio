import { Briefcase } from "lucide-react";
import { MobileCollapsibleSection } from "./MobileCollapsibleSection";
import { ExperienceCard } from "./ExperienceCard";
import type { ContentData } from "@/types/content";

interface ExperienceSectionProps {
  content: ContentData;
}

export function ExperienceSection({ content }: ExperienceSectionProps) {

  const labels = {
    responsibilities: content.responsibilities,
    technologies: content.technologies,
    careerProgression: content.careerProgression,
    roleSingular: content.roleSingular,
    rolePlural: content.rolePlural,
  };

  const cards = content.experiences.map((experience, idx) => (
    <ExperienceCard key={idx} experience={experience} labels={labels} />
  ));

  return (
    <section
      id="experiencia"
      aria-labelledby="experiencia-heading"
      className="motion-safe:animate-fade-up"
    >
      <MobileCollapsibleSection
        title={content.experienceTitle}
        icon={Briefcase}
        headingId="experiencia-heading"
      >
        <div className="space-y-8">{cards}</div>
      </MobileCollapsibleSection>
    </section>
  );
}
