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

import { useContent } from "@/hooks/useContent";
import { Block } from "./Block";
import { DiagramAsset } from "@/components/projects/DiagramAsset";
import type { Project } from "@/types/content";

interface DiagramCardProps {
  project: Project;
}

export function DiagramCard({ project }: DiagramCardProps) {
  const { content } = useContent();

  if (!project.diagram) return null;

  const { slug } = project;
  const title = content.archPage?.infraDiagramTitle ?? "";

  return (
    <Block id={`${slug}-diagram-heading`} title={title}>
      <DiagramAsset
        light={project.diagram}
        dark={project.diagramDark}
        alt={project.diagramAlt ?? title}
        className="w-full"
      />
    </Block>
  );
}
