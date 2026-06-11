import { MobileCollapsibleSection } from "./MobileCollapsibleSection";
import { SkillCategoryCard } from "./SkillCategoryCard";
import type { ContentData } from "@/types/content";

interface SkillsSectionProps {
  content: ContentData;
}

export function SkillsSection({ content }: SkillsSectionProps) {

  const cards = content.skills.map((skillCategory, idx) => (
    <SkillCategoryCard key={idx} skillCategory={skillCategory} />
  ));

  return (
    <section
      id="habilidades"
      aria-labelledby="habilidades-heading"
      className="motion-safe:animate-fade-up"
    >
      <MobileCollapsibleSection
        title={content.skillsTitle}
        headingId="habilidades-heading"
      >
        <div className="space-y-4">{cards}</div>
      </MobileCollapsibleSection>
    </section>
  );
}
