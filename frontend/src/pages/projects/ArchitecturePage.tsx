import { useEffect } from "react";
import { useContent } from "@/hooks/useContent";
import { ProjectTabPage } from "./ProjectTabPage";
import type { ProjectTabContent, ProjectSection } from "./ProjectTabPage";

/**
 * ArchitecturePage — T-CONTENT-04 / T-FE-QUAL-05
 *
 * Meta-page explaining how this portfolio is built: stack, infra, costs,
 * architecture decisions, and links.
 *
 * Route: /projetos/portifolio
 *
 * Delegates rendering to the generic `ProjectTabPage` template using
 * "diagram", "table", and "decisions" section types.
 */
export function ArchitecturePage() {
  const { content } = useContent();
  const project = content.projects?.["portifolio"];

  const hero = project?.hero ?? {
    title: "Portfolio Architecture",
    tagline: "How this site is built, hosted, and maintained.",
  };

  const seo = project?.seo ?? {
    title: "Portfolio Architecture — Marco Menezes",
    description:
      "Stack, terraform infra, monthly costs and architectural decisions for marco-menezes.com.",
  };

  const stack = project?.stack ?? [];
  const costs = project?.costs ?? [];
  const decisions = project?.decisions ?? [];
  const links = project?.links ?? {
    repo: "https://github.com/marcoaureliomenezes/portifolio",
    terraform:
      "https://github.com/marcoaureliomenezes/portifolio/tree/main/terraform",
    specs: "https://github.com/marcoaureliomenezes/portifolio/tree/main/specs",
  };
  const diagram = project?.diagram ?? "/assets/projects/portifolio/architecture.svg";

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
      id: "diagram",
      type: "diagram",
      title: "Infrastructure Diagram",
      diagram,
    },
    ...(stack.length > 0
      ? [
          {
            id: "stack",
            type: "table" as const,
            title: "Tech Stack",
            headers: ["Layer", "Technology"] as [string, string],
            rows: stack.map((row) => ({ col1: row.layer, col2: row.tech })),
          },
        ]
      : []),
    ...(costs.length > 0
      ? [
          {
            id: "costs",
            type: "table" as const,
            title: "Monthly Costs",
            headers: ["Service", "USD / month"] as [string, string],
            rows: costs.map((row) => ({
              col1: row.service,
              col2: `$${row.monthly_usd.toFixed(2)}`,
            })),
          },
        ]
      : []),
    ...(decisions.length > 0
      ? [
          {
            id: "decisions",
            type: "decisions" as const,
            title: "Architectural Decisions",
            items: decisions.map((d) => ({
              title: d.title,
              rationale: d.rationale,
              spec: d.spec,
            })),
          },
        ]
      : []),
  ];

  const tabContent: ProjectTabContent = {
    hero,
    sections,
    cta: {
      github: links.repo,
      githubLabel: "GitHub Repository",
      extraLinks: [
        { href: links.terraform, label: "Terraform" },
        { href: links.specs, label: "Specs" },
      ],
    },
    seo,
  };

  return <ProjectTabPage content={tabContent} slug="portifolio" />;
}
