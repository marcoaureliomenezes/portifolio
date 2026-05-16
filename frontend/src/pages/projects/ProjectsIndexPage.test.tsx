import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";

/**
 * ProjectsIndexPage.test.tsx — T-FE-PROJ-02
 *
 * Verifies:
 * A1: renders <h1> with the projects title from content
 * A2: renders exactly 3 project cards (links to /projetos/<slug>)
 * A3: renders fallback message when projects.list is empty
 */

// Mock Header to avoid matchMedia / ResizeObserver dependencies in jsdom
vi.mock("@/components/Header", () => ({
  Header: () => React.createElement("header", { "data-testid": "header-mock" }),
}));

vi.mock("react-helmet-async", () => ({
  Helmet: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  HelmetProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// Import after mock declarations (top-level await — vitest supports this)
const { ProjectsIndexPage } = await import("./ProjectsIndexPage");
const useContentModule = await import("@/hooks/useContent");

function renderWithProviders(
  ui: React.ReactElement,
  language: "pt" | "en" | "de" = "en",
) {
  return render(
    React.createElement(
      LanguageProvider,
      { initialLanguage: language },
      React.createElement(MemoryRouter, null, ui),
    ),
  );
}

describe("ProjectsIndexPage", () => {
  it("renders <h1> with the projects title from content", () => {
    renderWithProviders(React.createElement(ProjectsIndexPage));
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeVisible();
    // The en.json title should be a non-empty string
    expect(heading.textContent?.trim().length).toBeGreaterThan(0);
  });

  it("renders exactly 3 project cards with links to /projetos/<slug>", () => {
    renderWithProviders(React.createElement(ProjectsIndexPage));
    const links = screen.getAllByRole("link");
    const projectLinks = links.filter((l) => {
      const href = l.getAttribute("href") ?? "";
      return (
        href.includes("/projetos/dadaia-workspace") ||
        href.includes("/projetos/portifolio") ||
        href.includes("/projetos/tauan-games")
      );
    });
    expect(projectLinks).toHaveLength(3);
  });

  it("renders the header mock", () => {
    renderWithProviders(React.createElement(ProjectsIndexPage));
    expect(screen.getByTestId("header-mock")).toBeInTheDocument();
  });

  it("renders with Portuguese content when language is pt", () => {
    renderWithProviders(React.createElement(ProjectsIndexPage), "pt");
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeVisible();
  });

  it("renders fallback message when projects.list is empty", () => {
    // Override useContent via module spy so the page receives an empty list
    const spy = vi
      .spyOn(useContentModule, "useContent")
      .mockReturnValue({
        content: {
          projects: {
            index: {
              title: "My Projects",
              subtitle: "Projects subtitle",
              seo: {
                title: "Projects — Marco Menezes",
                description: "All projects",
              },
            },
            list: [],
            kindCaseStudy: "Case Study",
            kindMeta: "Meta",
            kindGames: "Games",
          },
        } as ReturnType<typeof useContentModule.useContent>["content"],
        label: () => "",
        language: "en" as const,
        setLanguage: () => {},
      } as ReturnType<typeof useContentModule.useContent>);

    renderWithProviders(React.createElement(ProjectsIndexPage));
    expect(screen.getByText("Nenhum projeto cadastrado.")).toBeInTheDocument();
    spy.mockRestore();
  });
});
