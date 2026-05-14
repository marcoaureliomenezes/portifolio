import { useEffect } from "react";
import { useContent } from "@/hooks/useContent";
import { ProjectTabPage } from "./ProjectTabPage";
import type { ProjectTabContent, ProjectSection } from "./ProjectTabPage";
import type { ProjectSectionData } from "@/types/content";

/**
 * DadaiaWorkspacePage — T-CONTENT-02
 *
 * Concrete project tab page for `/projetos/dadaia-workspace`.
 * Consumes `projects["dadaia-workspace"]` from the active language JSON
 * and delegates rendering to the generic `ProjectTabPage` template.
 *
 * SEO: sets document.title + description meta tag via useEffect (no extra dep).
 */
export function DadaiaWorkspacePage() {
  const { content } = useContent();
  const project = content.projects?.["dadaia-workspace"];

  // Fallback to sensible defaults if content is not yet populated.
  const hero = project?.hero ?? {
    title: "dadaia-workspace",
    tagline: "Agent-driven SDD ecosystem.",
  };

  const seo = project?.seo ?? {
    title: "dadaia-workspace — Marco Menezes",
    description: "Ecossistema agente SDD para spec-driven development.",
  };

  const cta = project?.cta ?? {
    github: "https://github.com/marcoaureliomenezes/dadaia-workspace",
  };

  // Apply SEO meta tags imperatively — no extra runtime dependency required.
  useEffect(() => {
    document.title = seo.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", seo.description);
    } else {
      const tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      tag.setAttribute("content", seo.description);
      document.head.appendChild(tag);
    }
    const metaOgTitle = document.querySelector('meta[property="og:title"]');
    if (metaOgTitle) {
      metaOgTitle.setAttribute("content", seo.title);
    }
    const metaOgDesc = document.querySelector('meta[property="og:description"]');
    if (metaOgDesc) {
      metaOgDesc.setAttribute("content", seo.description);
    }
  }, [seo.title, seo.description]);

  // Map content sections to ProjectSection union type.
  const sections: ProjectSection[] = (project?.sections ?? []).map(
    (s: ProjectSectionData): ProjectSection => {
      if (s.items) {
        return { id: s.id, type: "status", title: s.title, items: s.items };
      }
      if (s.diagram) {
        return {
          id: s.id,
          type: "diagram",
          title: s.title,
          body: s.body ?? "",
          diagram: s.diagram,
        };
      }
      return { id: s.id, title: s.title, body: s.body ?? "" };
    },
  );

  const tabContent: ProjectTabContent = { hero, sections, cta, seo };

  return <ProjectTabPage content={tabContent} slug="dadaia-workspace" />;
}
