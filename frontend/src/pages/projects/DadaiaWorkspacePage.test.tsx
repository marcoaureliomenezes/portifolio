import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";

/**
 * DadaiaWorkspacePage.test.tsx — T-CONTENT-02
 *
 * Verifies:
 * A1: component renders (route wiring is in App — checked separately)
 * A2: single <h1> with the project title visible
 * A4: CTA link has correct GitHub href and security attributes
 * A5: GitHub link contains marcoaureliomenezes/dadaia-workspace
 */

vi.mock("react-helmet-async", () => ({
  Helmet: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  HelmetProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(
    React.createElement(
      LanguageProvider,
      { initialLanguage: "en" },
      React.createElement(MemoryRouter, null, ui),
    ),
  );
}

// Import after mock declarations
const { DadaiaWorkspacePage } = await import("./DadaiaWorkspacePage");

describe("DadaiaWorkspacePage", () => {
  it("renders a single visible <h1>", () => {
    renderWithProviders(React.createElement(DadaiaWorkspacePage));
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toBeVisible();
  });

  it("h1 text contains 'dadaia-workspace'", () => {
    renderWithProviders(React.createElement(DadaiaWorkspacePage));
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.textContent?.toLowerCase()).toContain("dadaia-workspace");
  });

  it("GitHub CTA link has correct href containing dadaia-workspace repo", () => {
    renderWithProviders(React.createElement(DadaiaWorkspacePage));
    const links = screen.getAllByRole("link");
    const githubLinks = links.filter((l) =>
      l.getAttribute("href")?.includes("dadaia-workspace"),
    );
    expect(githubLinks.length).toBeGreaterThanOrEqual(1);
    const link = githubLinks[0];
    expect(link.getAttribute("href")).toContain(
      "github.com/marcoaureliomenezes/dadaia-workspace",
    );
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(link.getAttribute("rel")).toContain("noreferrer");
  });

  it("renders with Portuguese content when language is pt", () => {
    render(
      React.createElement(
        LanguageProvider,
        { initialLanguage: "pt" },
        React.createElement(
          MemoryRouter,
          null,
          React.createElement(DadaiaWorkspacePage),
        ),
      ),
    );
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toBeVisible();
  });
});
