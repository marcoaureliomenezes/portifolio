import { MobileCollapsibleSection } from "./MobileCollapsibleSection";
import { SkillCategoryCard } from "./SkillCategoryCard";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";
import type { ContentData } from "@/types/content";

interface SkillsSectionProps {
  content: ContentData;
}

export function SkillsSection({ content }: SkillsSectionProps) {
  const { ref, inView } = useInView<HTMLElement>();

  const cards = content.skills.map((skillCategory, idx) => (
    <SkillCategoryCard key={idx} skillCategory={skillCategory} />
  ));

  return (
    <section
      id="habilidades"
      aria-labelledby="habilidades-heading"
      ref={ref}
      className={cn("opacity-0", inView && "opacity-100 motion-safe:animate-fade-up")}
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
