/**
 * projects.test.ts — T-PC-A-02
 *
 * Unit tests for ProjectsContentSchema (Zod discriminated union, zero z.any()).
 * TDD approach: tests written first, schema written to make them pass.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import {
  ProjectsContentSchema,
  CaseStudyProjectSchema,
  MetaProjectSchema,
  GamesProjectSchema,
} from "./projects";

// ---------------------------------------------------------------------------
// Fixtures — minimal valid data per kind
// ---------------------------------------------------------------------------

const validProjectCard = {
  cover: "/assets/projects/dadaia-workspace/cover.webp",
  summary: "A short summary under 280 chars.",
  tech: ["TypeScript", "React", "Vite"],
};

const validSeo = {
  title: "SEO Title — Marco Menezes",
  description: "SEO description.",
};

const validSection = {
  id: "what",
  title: "What is it",
  body: "Some body text.",
};

const validCaseStudy = {
  slug: "dadaia-workspace",
  kind: "case-study" as const,
  hero: { title: "dadaia-workspace", tagline: "AI-driven SDD." },
  card: validProjectCard,
  seo: validSeo,
  sections: [validSection],
  cta: { github: "https://github.com/marcoaureliomenezes/dadaia-workspace" },
};

const validStackRow = { layer: "Frontend", tech: "React 18 + Vite 7" };
const validCostRow = { service: "Route53", monthly_usd: 0.5 };
const validDecision = {
  title: "React/Vite over Next.js",
  rationale: "No SSR needed.",
  spec: "https://github.com/marcoaureliomenezes/portifolio/specs",
};

const validMeta = {
  slug: "portifolio",
  kind: "meta" as const,
  hero: { title: "Portfolio Architecture", tagline: "How this site is built." },
  card: validProjectCard,
  seo: validSeo,
  sections: [validSection],
  stack: [validStackRow],
  costs: [validCostRow],
  decisions: [validDecision],
  links: {
    repo: "https://github.com/marcoaureliomenezes/portifolio",
    terraform: "https://github.com/marcoaureliomenezes/portifolio/terraform",
    specs: "https://github.com/marcoaureliomenezes/portifolio/specs",
  },
};

const validGameLink = {
  slug: "aero-fighters",
  title: "Aero Fighters",
  engine: "Three.js",
  cover: "/assets/projects/tauan-games/aero-fighters-cover.webp",
  body: "An aerial shooter game.",
  repo: "https://github.com/marcoaureliomenezes/tauan-games",
  playUrl:
    "https://marcoaureliomenezes.github.io/tauan-games/aero-fighters/",
};

const validGames = {
  slug: "tauan-games",
  kind: "games" as const,
  hero: { title: "tauan-games", tagline: "Games built with Tauan." },
  card: validProjectCard,
  seo: validSeo,
  items: [validGameLink],
};

const validProjectsContent = {
  index: {
    title: "Projects",
    description: "All projects.",
  },
  list: [validCaseStudy, validMeta, validGames],
};

// ---------------------------------------------------------------------------
// CaseStudyProject schema
// ---------------------------------------------------------------------------

describe("CaseStudyProjectSchema", () => {
  it("accepts valid case-study data", () => {
    const result = CaseStudyProjectSchema.safeParse(validCaseStudy);
    expect(result.success).toBe(true);
  });

  it("requires at least 1 section", () => {
    const result = CaseStudyProjectSchema.safeParse({
      ...validCaseStudy,
      sections: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects kind other than case-study", () => {
    const result = CaseStudyProjectSchema.safeParse({
      ...validCaseStudy,
      kind: "meta",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional diagram and diagramAlt", () => {
    const result = CaseStudyProjectSchema.safeParse({
      ...validCaseStudy,
      diagram: "/assets/projects/dadaia-workspace/architecture-light.svg",
      diagramAlt: "Architecture diagram",
    });
    expect(result.success).toBe(true);
  });

  it("requires slug to match ^[a-z0-9-]+$", () => {
    const result = CaseStudyProjectSchema.safeParse({
      ...validCaseStudy,
      slug: "Invalid Slug!",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// MetaProject schema
// ---------------------------------------------------------------------------

describe("MetaProjectSchema", () => {
  it("accepts valid meta data", () => {
    const result = MetaProjectSchema.safeParse(validMeta);
    expect(result.success).toBe(true);
  });

  it("requires at least 1 section", () => {
    const result = MetaProjectSchema.safeParse({ ...validMeta, sections: [] });
    expect(result.success).toBe(false);
  });

  it("requires at least 1 stack row", () => {
    const result = MetaProjectSchema.safeParse({ ...validMeta, stack: [] });
    expect(result.success).toBe(false);
  });

  it("requires at least 1 decision", () => {
    const result = MetaProjectSchema.safeParse({ ...validMeta, decisions: [] });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// GamesProject schema
// ---------------------------------------------------------------------------

describe("GamesProjectSchema", () => {
  it("accepts valid games data", () => {
    const result = GamesProjectSchema.safeParse(validGames);
    expect(result.success).toBe(true);
  });

  it("requires at least 1 item", () => {
    const result = GamesProjectSchema.safeParse({ ...validGames, items: [] });
    expect(result.success).toBe(false);
  });

  it("requires playUrl in each GameLink", () => {
    const result = GamesProjectSchema.safeParse({
      ...validGames,
      items: [{ ...validGameLink, playUrl: undefined }],
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ProjectsContentSchema (discriminated union)
// ---------------------------------------------------------------------------

describe("ProjectsContentSchema", () => {
  it("accepts valid content with all 3 kinds", () => {
    const result = ProjectsContentSchema.safeParse(validProjectsContent);
    expect(result.success).toBe(true);
  });

  it("requires index with title and description", () => {
    const result = ProjectsContentSchema.safeParse({
      ...validProjectsContent,
      index: { title: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects an item with unknown kind", () => {
    const result = ProjectsContentSchema.safeParse({
      ...validProjectsContent,
      list: [
        {
          ...validCaseStudy,
          kind: "unknown-kind",
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("requires list to be an array", () => {
    const result = ProjectsContentSchema.safeParse({
      ...validProjectsContent,
      list: null,
    });
    expect(result.success).toBe(false);
  });

  it("uses discriminatedUnion — each kind parses its own fields", () => {
    // meta without stack should fail
    const metaWithoutStack = {
      ...validProjectsContent,
      list: [{ ...validMeta, stack: undefined }],
    };
    const result = ProjectsContentSchema.safeParse(metaWithoutStack);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Zero z.any() structural contract
// ---------------------------------------------------------------------------

describe("Schema structural contract (zero z.any())", () => {
  it("GameLink requires all 7 explicit fields", () => {
    const partial = {
      slug: "aero-fighters",
      title: "Aero Fighters",
      engine: "Three.js",
      // cover, body, repo, playUrl intentionally omitted
    };
    const result = GamesProjectSchema.safeParse({
      ...validGames,
      items: [partial],
    });
    expect(result.success).toBe(false);
  });

  it("ArchDecision requires title, rationale, spec", () => {
    const result = MetaProjectSchema.safeParse({
      ...validMeta,
      decisions: [{ title: "A decision" }],
    });
    expect(result.success).toBe(false);
  });

  it("StackRow requires layer and tech", () => {
    const result = MetaProjectSchema.safeParse({
      ...validMeta,
      stack: [{ layer: "Frontend" }],
    });
    expect(result.success).toBe(false);
  });

  it("CostRow requires service and monthly_usd", () => {
    const result = MetaProjectSchema.safeParse({
      ...validMeta,
      costs: [{ service: "Route53" }],
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Media, code, item href, hero.media; stat and section diagram are gone
// ---------------------------------------------------------------------------

const cut = (name: string) => ({
  webm: `/assets/projects/x/${name}.webm`,
  mp4: `/assets/projects/x/${name}.mp4`,
  poster: `/assets/projects/x/${name}.webp`,
  width: 1280,
  height: 720,
});
const videoMedia = {
  type: "video" as const,
  alt: "Demo",
  caption: "A demo.",
  desktop: cut("desktop"),
  phone: { ...cut("phone"), width: 360, height: 640 },
};
const svgMedia = {
  type: "svg" as const,
  alt: "Architecture",
  light: "/assets/projects/x/arch-light.svg",
  dark: "/assets/projects/x/arch-dark.svg",
};
const parseSection = (section: object) =>
  CaseStudyProjectSchema.safeParse({
    ...validCaseStudy,
    sections: [{ ...validSection, ...section }],
  });

describe("project section media, code and href", () => {
  it("keeps a video media with both cuts", () => {
    const r = parseSection({ media: videoMedia });
    expect(r.success && r.data.sections[0].media).toEqual(videoMedia);
  });

  it("keeps an svg media with its light/dark pair", () => {
    const r = parseSection({ media: svgMedia });
    expect(r.success && r.data.sections[0].media).toEqual(svgMedia);
  });

  it("keeps code and an item href", () => {
    const items = [{ label: "Docs", value: "Read", href: "https://example.com/docs" }];
    const r = parseSection({ code: "pip install x", items });
    expect(r.success && r.data.sections[0].code).toBe("pip install x");
    expect(r.success && r.data.sections[0].items).toEqual(items);
  });

  it("keeps hero.media", () => {
    const r = CaseStudyProjectSchema.safeParse({
      ...validCaseStudy,
      hero: { ...validCaseStudy.hero, media: videoMedia },
    });
    expect(r.success && r.data.hero.media).toEqual(videoMedia);
  });

  it.each([
    ["a video without the phone cut", { ...videoMedia, phone: undefined }],
    ["a cut without a mp4", { ...videoMedia, desktop: { ...cut("d"), mp4: undefined } }],
    ["a cut with a non-numeric width", { ...videoMedia, desktop: { ...cut("d"), width: "wide" } }],
    ["an svg without the dark path", { ...svgMedia, dark: undefined }],
    ["a media without alt", { ...svgMedia, alt: undefined }],
    ["an unknown media type", { ...svgMedia, type: "gif" }],
  ])("rejects %s", (_name, media) => {
    expect(parseSection({ media }).success).toBe(false);
  });
});

describe("removed fields are stripped", () => {
  it("drops a library stat", () => {
    const r = ProjectsContentSchema.safeParse({
      index: validProjectsContent.index,
      list: [
        {
          slug: "lib",
          kind: "library",
          hero: validCaseStudy.hero,
          card: validProjectCard,
          seo: validSeo,
          sections: [validSection],
          pypi: { package: "lib", version: "1.0.0", installCommand: "pip install lib" },
          stat: { label: "rows/s", value: "5.1M" },
          links: { repo: "https://github.com/a/b", pypi: "https://pypi.org/project/lib" },
        },
      ],
    });
    expect(r.success).toBe(true);
    expect(r.success && "stat" in r.data.list[0]).toBe(false);
  });

  it("drops a section diagram", () => {
    const r = parseSection({ diagram: "/assets/projects/x/old.svg" });
    expect(r.success).toBe(true);
    expect(r.success && "diagram" in r.data.sections[0]).toBe(false);
  });
});

describe("the three real locale files", () => {
  it.each(["pt", "en", "de"])("%s projectsV2 parses", (lang) => {
    const file = resolve(__dirname, `../../../public/content/${lang}.json`);
    const { projectsV2 } = JSON.parse(readFileSync(file, "utf-8"));
    const r = ProjectsContentSchema.safeParse(projectsV2);
    expect(r.success).toBe(true);
  });
});

describe("project link URLs accept only http(s)", () => {
  it.each(["javascript:alert(1)", "data:text/html,x"])("rejects %s", (bad) => {
    expect(GamesProjectSchema.safeParse({ ...validGames, items: [{ ...validGameLink, playUrl: bad }] }).success).toBe(false);
    expect(GamesProjectSchema.safeParse({ ...validGames, items: [{ ...validGameLink, repo: bad }] }).success).toBe(false);
    expect(CaseStudyProjectSchema.safeParse({ ...validCaseStudy, cta: { github: bad } }).success).toBe(false);
  });

  it("rejects javascript: in a decision spec link", () => {
    const decisions = [{ ...validDecision, spec: "javascript:alert(1)" }];
    expect(MetaProjectSchema.safeParse({ ...validMeta, decisions }).success).toBe(false);
  });

  it("rejects javascript: in a section item href", () => {
    const items = [{ label: "Docs", value: "Read", href: "javascript:alert(1)" }];
    expect(parseSection({ items }).success).toBe(false);
  });

  it("accepts an https URL", () => {
    expect(
      CaseStudyProjectSchema.safeParse({ ...validCaseStudy, cta: { github: "https://github.com/x/y" } }).success,
    ).toBe(true);
  });
});
