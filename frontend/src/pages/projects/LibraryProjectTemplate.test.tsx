/**
 * LibraryProjectTemplate.test.tsx — T-PC2-R2-04
 *
 * Unit tests for LibraryProjectTemplate:
 *  - SEO hook sets document.title
 *  - Renders hero title + tagline
 *  - Renders the pip install command + version badge, and no stat
 *  - Renders PyPI and GitHub links as proper anchors
 *  - Renders body sections
 *  - Copy button is present and accessible
 *  - Page order, copy buttons and flat sections inside the real route mirror
 */
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { track } from "@dadaia/analytics-sdk";
import { LibraryProjectTemplate } from "./LibraryProjectTemplate";
import { ProjectDetailPage } from "./ProjectDetailPage";
import { ProjectsLayoutShell } from "@/components/projects/ProjectsLayoutShell";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { LanguageContext } from "@/contexts/LanguageContext";
import type { ContentData, LibraryProject } from "@/types/content";

vi.mock("@dadaia/analytics-sdk", () => ({ track: vi.fn() }));
// Boundary stub: the header's own contract lives in Header.test.tsx.
vi.mock("@/components/Header", () => ({ Header: () => <header>header</header> }));

const writeText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  vi.mocked(track).mockClear();
  writeText.mockClear();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query === "(min-width: 640px)",
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      private cb: (entries: { isIntersecting: boolean }[]) => void;
      constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
        this.cb = cb;
      }
      observe() {
        this.cb([{ isIntersecting: true }]);
      }
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
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
    cover: "/fixture/cover.webp",
    summary: "Generates realistic synthetic data in seconds.",
    tech: ["Python", "Pandas", "PySpark"],
  },
  seo: {
    title: "rand-engine — Marco Menezes",
    description: "Open-source Python library on PyPI.",
  },
  pypi: {
    package: "rand-engine",
    version: "1.2.3",
    installCommand: "pip install rand-engine",
  },
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

  it("renders the install command and version", () => {
    renderTemplate();
    expect(screen.getByTestId("install-command").textContent).toBe(
      "pip install rand-engine",
    );
    expect(screen.getByTestId("library-version").textContent).toContain("1.2.3");
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

  it("renders no stat on the page or the card", () => {
    renderTemplate();
    expect(screen.queryByTestId("library-stat")).toBeNull();
    expect(screen.queryByTestId("project-card-stat")).toBeNull();
  });
});

const svg = (name: string) => ({
  type: "svg" as const,
  alt: `scene ${name}`,
  light: `/m/${name}-light.svg`,
  dark: `/m/${name}-dark.svg`,
});

const richProject: LibraryProject = {
  ...mockProject,
  hero: {
    ...mockProject.hero,
    media: {
      type: "video",
      alt: "hero loop",
      desktop: { webm: "/m/d.webm", mp4: "/m/d.mp4", poster: "/m/d.jpg", width: 1280, height: 720 },
      phone: { webm: "/m/p.webm", mp4: "/m/p.mp4", poster: "/m/p.jpg", width: 360, height: 450 },
    },
  },
  links: { ...mockProject.links, docs: "https://docs.example.com/rand-engine" },
  sections: [
    { id: "tables", title: "Related tables", body: "Hashed keys.", media: svg("tables") },
    { id: "streams", title: "Event streams", body: "Micro-batches.", media: svg("streams") },
    { id: "try", title: "Try it", code: "spec = {'age': 1}" },
    { id: "why", title: "Why it exists", body: "Realistic test data." },
    {
      id: "facts",
      title: "ignored",
      items: [
        { label: "License", value: "MIT" },
        { label: "Python", value: "3.10", href: "https://www.python.org" },
      ],
    },
  ],
};

const content = {
  siteChrome: {
    breadcrumb: { label: "Breadcrumb", projects: "Projects" },
    backToProjects: "Back to projects",
  },
  libraryPage: {
    installTitle: "Install",
    versionLabel: "version",
    copyLabel: "Copy",
    copiedLabel: "Copied",
    linkPypi: "PyPI",
    linkDocs: "Docs",
    howTitle: "How it works",
    factsTitle: "Facts",
  },
  projectsV2: { index: { title: "Projects", description: "d" }, list: [richProject] },
} as unknown as ContentData;

function renderRoute() {
  return render(
    <LanguageContext.Provider
      value={{ language: "en", setLanguage: () => undefined, content, isLoading: false }}
    >
      <MemoryRouter initialEntries={["/projetos/rand-engine"]}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route element={<ProjectsLayoutShell />}>
              <Route path="/projetos/:slug" element={<ProjectDetailPage />} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </LanguageContext.Provider>,
  );
}

describe("LibraryProjectTemplate — in the route mirror", () => {
  it("renders no main of its own: the shell owns the one main", () => {
    const { container } = renderRoute();
    expect(container.querySelectorAll("main").length).toBe(1);
  });

  it("shows the design's order, with the pin in the facts heading", () => {
    const { container } = renderRoute();
    const at = (el: Element | null) => {
      if (!el) throw new Error("missing element in the page order");
      return el;
    };
    const order = [
      screen.getByTestId("breadcrumb"),
      screen.getByRole("heading", { level: 1, name: "rand-engine" }),
      screen.getByText("High-performance synthetic data generation."),
      screen.getByTestId("library-version"),
      screen.getByTestId("install-command"),
      at(container.querySelector('video[aria-label="hero loop"]')),
      screen.getByRole("heading", { name: "How it works" }),
      screen.getByRole("heading", { name: "Related tables" }),
      screen.getByRole("heading", { name: "Event streams" }),
      screen.getByRole("heading", { name: "Try it" }),
      screen.getByRole("heading", { name: "Why it exists" }),
      screen.getByRole("heading", { name: "Facts · rand-engine 1.2.3" }),
      screen.getByTestId("back-link"),
    ];
    order.slice(1).forEach((el, i) => {
      expect(
        order[i].compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

  it("copies exactly the install command and tracks copy_install once", async () => {
    renderRoute();
    fireEvent.click(screen.getByTestId("copy-install"));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText).toHaveBeenCalledWith("pip install rand-engine");
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("project_cta", {
      project: "rand-engine",
      action: "copy_install",
    });
  });

  it("copies exactly the Try it code and tracks nothing", async () => {
    renderRoute();
    const section = screen.getByRole("heading", { name: "Try it" }).closest("section");
    fireEvent.click(within(section as HTMLElement).getByRole("button", { name: "Copy" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText).toHaveBeenCalledWith("spec = {'age': 1}");
    expect(track).not.toHaveBeenCalled();
  });

  it("renders every section flat: no boxed descendant, no shadow, no disclosure", () => {
    renderRoute();
    const sections = screen.getAllByTestId("project-section");
    expect(sections.length).toBe(5);
    for (const section of sections) {
      const nodes = [section, ...Array.from(section.querySelectorAll("*"))];
      for (const el of nodes) {
        const tokens = Array.from(el.classList);
        const boxed =
          tokens.some((t) => t.startsWith("rounded")) &&
          tokens.some((t) => t === "border" || t.startsWith("border-"));
        expect(boxed).toBe(false);
        expect(tokens.some((t) => t.startsWith("shadow"))).toBe(false);
      }
      expect(section.querySelector("[aria-expanded]")).toBeNull();
    }
  });

  it("renders the stat nowhere", () => {
    renderRoute();
    expect(screen.queryByTestId("library-stat")).toBeNull();
    expect(screen.queryByTestId("project-card-stat")).toBeNull();
  });
});
