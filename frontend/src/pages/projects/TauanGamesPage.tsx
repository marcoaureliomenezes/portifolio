import { useEffect } from "react";
import { useContent } from "@/hooks/useContent";
import { ProjectTabPage } from "./ProjectTabPage";
import type { ProjectTabContent, ProjectSection } from "./ProjectTabPage";
import type { GameItem } from "@/types/content";

/**
 * TauanGamesPage — T-CONTENT-03 / T-FE-QUAL-05
 *
 * Concrete project tab page for `/projetos/tauan-games`.
 * Delegates rendering to the generic `ProjectTabPage` template using the
 * "grid" section type for game cards.
 *
 * SEO: sets document.title + description meta tag via useEffect.
 */
export function TauanGamesPage() {
  const { content } = useContent();
  const project = content.projects?.["tauan-games"];

  const hero = project?.hero ?? {
    title: "tauan-games",
    tagline: "Games built at home with my son Tauan.",
  };

  const seo = project?.seo ?? {
    title: "tauan-games — Marco Menezes",
    description: "Game prototypes developed with Tauan.",
  };

  const items: GameItem[] = project?.items ?? [];

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

  const sections: ProjectSection[] = [
    {
      id: "games",
      type: "grid",
      title: "Games",
      items: items.map((item) => ({
        slug: item.slug,
        title: item.title,
        engine: item.engine,
        image: item.image,
        body: item.body,
        repo: item.repo,
      })),
      emptyMessage: "Os jogos serao listados aqui em breve.",
    },
  ];

  const tabContent: ProjectTabContent = {
    hero,
    sections,
    cta: {
      github: "https://github.com/marcoaureliomenezes/tauan-games",
      githubLabel: "GitHub",
    },
    seo,
  };

  return <ProjectTabPage content={tabContent} slug="tauan-games" />;
}
