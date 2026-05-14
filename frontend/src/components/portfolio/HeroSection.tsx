import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ContentData } from "@/types/content";

interface HeroSectionProps {
  content: ContentData;
}

export function HeroSection({ content }: HeroSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="w-full shadow-glow border-0 bg-gradient-to-br from-card to-accent/30 hover:shadow-large transition-all duration-300">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg md:text-2xl font-bold text-primary">
          {content.resumeTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={`text-muted-foreground leading-relaxed mb-6 text-sm md:text-sm ${
            !isExpanded ? "line-clamp-4" : ""
          }`}
        >
          {isExpanded ? content.resume.full : content.resume.short}
        </p>
        <Button
          variant="link"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-0 h-auto text-primary hover:text-primary-foreground font-semibold transition-colors duration-200"
        >
          {isExpanded ? content.seeLess : content.seeMore}
        </Button>
      </CardContent>
    </Card>
  );
}
