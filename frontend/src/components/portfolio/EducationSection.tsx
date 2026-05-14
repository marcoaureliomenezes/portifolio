import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileCollapsibleSection } from "./MobileCollapsibleSection";
import type { ContentData } from "@/types/content";

interface EducationSectionProps {
  content: ContentData;
}

function EducationBody({ content, mobile = false }: { content: ContentData; mobile?: boolean }) {
  return (
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full" aria-hidden="true" />
      <div className="pl-8">
        <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl p-6 border border-border/50">
          <h3
            className={`${
              mobile ? "text-sm" : "text-base md:text-xl"
            } font-bold text-foreground mb-2`}
          >
            {content.education.degree}
          </h3>
          <p className={`text-primary font-semibold mb-2 ${mobile ? "text-xs" : ""}`}>
            {content.education.institution}
          </p>
          <p className={`text-muted-foreground mb-4 ${mobile ? "text-xs" : "text-sm"}`}>
            {content.education.period}
          </p>
          <div className="space-y-2">
            <p className={`text-foreground ${mobile ? "text-xs" : "text-sm"}`}>
              {content.education.coursework}
            </p>
            <p className={`text-foreground ${mobile ? "text-xs" : "text-sm"}`}>
              {content.education.thesis}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EducationSection({ content }: EducationSectionProps) {
  return (
    <section id="educacao" aria-labelledby="educacao-heading">
      {/* Desktop */}
      <Card className="hidden md:block w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle
            id="educacao-heading"
            className="text-lg md:text-2xl font-bold text-foreground flex items-center gap-3"
          >
            <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-green-600 flex-shrink-0" aria-hidden="true" />
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" aria-hidden="true" />
            {content.educationTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <EducationBody content={content} />
        </CardContent>
      </Card>

      {/* Mobile */}
      <MobileCollapsibleSection
        title={content.educationTitle}
        icon={GraduationCap}
        iconColor="text-green-600"
        headingId="educacao-heading"
      >
        <div className="space-y-6">
          <EducationBody content={content} mobile />
        </div>
      </MobileCollapsibleSection>
    </section>
  );
}
