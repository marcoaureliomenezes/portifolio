/**
 * LibraryProjectTemplate.test.tsx — T-PC2-R2-04
 *
 * Unit tests for LibraryProjectTemplate:
 *  - SEO hook sets document.title
 *  - Renders hero title + tagline
 *  - Renders the pip install command + version badge + headline stat
 *  - Renders PyPI and GitHub links as proper anchors
 *  - Renders body sections
 *  - Copy button is present and accessible
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LibraryProjectTemplate } from "./LibraryProjectTemplate";
import type { LibraryProject } from "@/types/content";

afterEach(() => {
  cleanup();
  document.title = "";
  document
    .querySelectorAll(
      'meta[name="description"], meta[property="og:title"], meta[property="og:description"]',
    )
    .forEach((el) => el.remove());
});

const mockProject: LibraryProject = {
  slug: "rand-engine",
  kind: "library",
  hero: {
    title: "rand-engine",
    tagline: "High-performance synthetic data generation.",
  },
  card: {
    cover: "/assets/projects/rand-engine/cover.webp",
    summary: "Generates realistic synthetic data in seconds.",
    tech: ["Python", "Pandas", "PySpark"],
  },
  seo: {
    title: "rand-engine — Marco Menezes",
    description: "Open-source Python library on PyPI.",
  },
  diagram: "/assets/projects/rand-engine/architecture-light.svg",
  diagramDark: "/assets/projects/rand-engine/architecture-dark.svg",
  diagramAlt: "rand-engine architecture",
  pypi: {
    package: "rand-engine",
    version: "0.6.4",
    installCommand: "pip install rand-engine",
  },
  stat: { label: "rows/s (Spark)", value: "5.1M" },
  sections: [
    { id: "what", title: "What is it", body: "A Python library." },
    { id: "why", title: "Why", body: "Realistic test data." },
  ],
  links: {
    repo: "https://github.com/marcoaureliomenezes/rand_engine",
    pypi: "https://pypi.org/project/rand-engine/",
  },
};

function renderTemplate(project: LibraryProject = mockProject) {
  return render(
    <MemoryRouter>
      <LibraryProjectTemplate project={project} />
    </MemoryRouter>,
  );
}

describe("LibraryProjectTemplate", () => {
  it("sets document.title from seo", () => {
    renderTemplate();
    expect(document.title).toBe("rand-engine — Marco Menezes");
  });

  it("renders hero title and tagline", () => {
    renderTemplate();
    expect(
      screen.getByRole("heading", { level: 1, name: "rand-engine" }),
    ).toBeTruthy();
    expect(
      screen.getByText("High-performance synthetic data generation."),
    ).toBeTruthy();
  });

  it("renders the install command, version and headline stat", () => {
    renderTemplate();
    expect(screen.getByTestId("install-command").textContent).toBe(
      "pip install rand-engine",
    );
    expect(screen.getByTestId("library-version").textContent).toContain("0.6.4");
    expect(screen.getByTestId("library-stat").textContent).toContain("5.1M");
  });

  it("renders PyPI and GitHub links as external anchors", () => {
    renderTemplate();
    const anchors = screen.getAllByRole("link");
    const hrefs = anchors.map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("https://pypi.org/project/rand-engine/");
    expect(hrefs).toContain("https://github.com/marcoaureliomenezes/rand_engine");
    for (const a of anchors) {
      expect(a.getAttribute("rel")).toContain("noopener");
    }
  });

  it("renders body sections", () => {
    renderTemplate();
    expect(screen.getByText("A Python library.")).toBeTruthy();
    expect(screen.getByText("Realistic test data.")).toBeTruthy();
  });

  it("renders an accessible copy button", () => {
    renderTemplate();
    expect(screen.getByTestId("copy-install")).toBeTruthy();
  });

  it("renders theme-aware diagram variants", () => {
    renderTemplate();
    expect(screen.getByTestId("diagram-light")).toBeTruthy();
    expect(screen.getByTestId("diagram-dark")).toBeTruthy();
  });

  it("omits the stat badge when stat is absent", () => {
    const { stat: _stat, ...rest } = mockProject;
    renderTemplate(rest as LibraryProject);
    expect(screen.queryByTestId("library-stat")).toBeNull();
  });
});
