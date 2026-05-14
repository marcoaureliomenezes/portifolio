import { Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  };

  const cards = content.experiences.map((experience, idx) => (
    <ExperienceCard key={idx} experience={experience} labels={labels} />
  ));

  return (
    <section id="experiencia">
      {/* Desktop — always visible */}
      <Card className="hidden md:block w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-2xl font-bold text-foreground flex items-center gap-3">
            <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-blue-600 flex-shrink-0" />
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
            {content.experienceTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">{cards}</CardContent>
      </Card>

      {/* Mobile — collapsible */}
      <MobileCollapsibleSection
        title={content.experienceTitle}
        icon={Briefcase}
        iconColor="text-blue-600"
      >
        <div className="space-y-8">{cards}</div>
      </MobileCollapsibleSection>
    </section>
  );
}
