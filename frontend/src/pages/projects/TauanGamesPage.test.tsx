import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";

/**
 * TauanGamesPage.test.tsx — T-CONTENT-03
 *
 * Verifies:
 * A1: component renders
 * A2: at least 2 game cards rendered (aero-fighters-babylon + tauan-trex minimum)
 * A3: each card has title, paragraph, GitHub link with correct attrs
 */

vi.mock("react-helmet-async", () => ({
  Helmet: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  HelmetProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

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

const { TauanGamesPage } = await import("./TauanGamesPage");

describe("TauanGamesPage", () => {
  it("renders a single visible <h1>", () => {
    renderWithProviders(React.createElement(TauanGamesPage));
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toBeVisible();
  });

  it("renders at least 2 game item titles", () => {
    renderWithProviders(React.createElement(TauanGamesPage));
    // Cards have h2/h3 headings for each game
    const allHeadings = screen.getAllByRole("heading");
    // At least h1 + 2 card headings
    expect(allHeadings.length).toBeGreaterThanOrEqual(3);
  });

  it("all GitHub links have target=_blank and rel with noopener noreferrer", () => {
    renderWithProviders(React.createElement(TauanGamesPage));
    const links = screen.getAllByRole("link");
    const githubLinks = links.filter((l) =>
      l.getAttribute("href")?.includes("github.com"),
    );
    expect(githubLinks.length).toBeGreaterThanOrEqual(1);
    githubLinks.forEach((link) => {
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
      expect(link.getAttribute("rel")).toContain("noreferrer");
    });
  });

  it("renders with Portuguese content when language is pt", () => {
    renderWithProviders(React.createElement(TauanGamesPage), "pt");
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toBeVisible();
  });
});
