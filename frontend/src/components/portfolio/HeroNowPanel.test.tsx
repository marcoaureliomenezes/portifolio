/**
 * HeroNowPanel.test.tsx — T-RD-05
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HeroNowPanel } from "./HeroNowPanel";
import type { ContentData } from "@/types/content";

const content = {
  nowPanel: {
    title: "now",
    currentRole: "current role",
    latestCert: "latest certification",
    latestProject: "latest project",
  },
  experiences: [
    {
      company: "Santander",
      fullName: "Santander Brazil",
      location: "BH",
      totalPeriod: "2021-",
      type: "main",
      roles: [{ title: "Senior Data Engineer", period: "2024-" }],
    },
  ],
  certifications: [
    { name: "Old Cert", priority: 5 },
    { name: "AWS Data Engineer", priority: 1 },
  ],
  projectsV2: {
    index: { title: "P", description: "d" },
    list: [
      {
        slug: "rand-engine",
        kind: "library",
        hero: { title: "rand-engine", tagline: "t" },
        card: { summary: "s", tech: ["A", "B", "C"] },
        seo: { title: "t", description: "d" },
        sections: [{ id: "what", title: "W", body: "b" }],
        pypi: { package: "rand-engine", version: "1", installCommand: "pip install rand-engine" },
        links: { repo: "https://r", pypi: "https://p" },
      },
    ],
  },
} as unknown as ContentData;

describe("HeroNowPanel", () => {
  it("renders role, top-priority cert and library project link", () => {
    render(
      <MemoryRouter>
        <HeroNowPanel content={content} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Senior Data Engineer · Santander/)).toBeInTheDocument();
    expect(screen.getByText("AWS Data Engineer")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "rand-engine" });
    expect(link.getAttribute("href")).toBe("/projetos/rand-engine");
  });

  it("renders nothing when content has no signal", () => {
    const { container } = render(
      <MemoryRouter>
        <HeroNowPanel content={{} as ContentData} />
      </MemoryRouter>,
    );
    expect(container.firstChild).toBeNull();
  });
});
