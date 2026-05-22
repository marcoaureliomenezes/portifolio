import { useState } from "react";
import { ChevronDown, ChevronUp, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileCollapsibleSection } from "./MobileCollapsibleSection";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  const { ref, inView } = useInView<HTMLElement>();
  const [desktopOpen, setDesktopOpen] = useState(false);

  return (
    <section
      id="educacao"
      aria-labelledby="educacao-heading"
      ref={ref}
      className={cn("opacity-0", inView && "opacity-100 motion-safe:animate-fade-up")}
    >
      {/* Desktop */}
      <Card className="hidden md:block w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
        <Collapsible open={desktopOpen} onOpenChange={setDesktopOpen}>
          <CollapsibleTrigger className="w-full text-left">
            <CardHeader className="pb-4">
              <CardTitle
                id="educacao-heading"
                className="text-lg md:text-2xl font-bold text-foreground flex items-center justify-between gap-3"
              >
                <span className="flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-green-600 flex-shrink-0" aria-hidden="true" />
                  <span className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" aria-hidden="true" />
                  {content.educationTitle}
                </span>
                {desktopOpen ? (
                  <ChevronUp className="h-5 w-5 text-primary" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-primary" aria-hidden="true" />
                )}
              </CardTitle>
              <div className="mt-4 rounded-lg border border-border/50 bg-gradient-to-r from-accent/10 to-secondary/10 p-4">
                <h3 className="text-base font-bold text-foreground">
                  {content.education.degree}
                </h3>
                <p className="text-sm font-semibold text-primary">
                  {content.education.institution}
                </p>
                <p className="text-xs text-muted-foreground">{content.education.period}</p>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              <EducationBody content={content} />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Mobile */}
      <MobileCollapsibleSection
        title={content.educationTitle}
        icon={GraduationCap}
        iconColor="text-green-600"
        headingId="educacao-heading"
        defaultOpen={false}
      >
        <div className="space-y-6">
          <EducationBody content={content} mobile />
        </div>
      </MobileCollapsibleSection>
    </section>
  );
}
