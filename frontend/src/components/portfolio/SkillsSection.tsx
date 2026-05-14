import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const compactCards = content.skills.map((skillCategory, idx) => (
    <SkillCategoryCard key={idx} skillCategory={skillCategory} compact />
  ));

  return (
    <section id="habilidades">
      {/* Desktop */}
      <Card className="hidden md:block w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
            {content.skillsTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">{cards}</CardContent>
      </Card>

      {/* Mobile */}
      <MobileCollapsibleSection title={content.skillsTitle}>
        <div className="space-y-4">{compactCards}</div>
      </MobileCollapsibleSection>
    </section>
  );
}
