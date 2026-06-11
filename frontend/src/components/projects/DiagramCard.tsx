/**
 * DiagramCard.tsx — T-PC2-R2-05
 *
 * Shared architecture-diagram card used by all project detail templates.
 * Replaces the copy-pasted Card block in CaseStudyTemplate/MetaProjectTemplate
 * that hardcoded the heading "Arquitetura" (AC-PC2-R2-05: heading is i18n,
 * sourced from content.archPage.infraDiagramTitle with a PT fallback).
 *
 * Renders nothing when the project has no diagram.
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useContent } from "@/hooks/useContent";
import { DiagramAsset } from "@/components/projects/DiagramAsset";
import type { Project } from "@/types/content";

interface DiagramCardProps {
  project: Project;
}

export function DiagramCard({ project }: DiagramCardProps) {
  const { content } = useContent();

  if (!project.diagram) return null;

  const { slug } = project;
  const title = content.archPage?.infraDiagramTitle ?? "Arquitetura";

  return (
    <section aria-labelledby={`${slug}-diagram-heading`}>
      <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
        <CardHeader className="pb-2">
          <h2
            id={`${slug}-diagram-heading`}
            className="text-lg md:text-2xl font-bold text-foreground"
          >
            {title}
          </h2>
        </CardHeader>
        <CardContent>
          <DiagramAsset
            light={project.diagram}
            dark={project.diagramDark}
            alt={project.diagramAlt ?? title}
            className="w-full"
          />
        </CardContent>
      </Card>
    </section>
  );
}
