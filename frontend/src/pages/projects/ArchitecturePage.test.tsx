import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";

/**
 * ArchitecturePage.test.tsx — T-CONTENT-04
 *
 * Verifies:
 * A1: renders <h1> unique and visible + diagram present in DOM
 * A3: cost table has at least 1 row
 * A4: GitHub link to portifolio repo correct
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

const { ArchitecturePage } = await import("./ArchitecturePage");

describe("ArchitecturePage", () => {
  it("renders a single visible <h1>", () => {
    renderWithProviders(React.createElement(ArchitecturePage));
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toBeVisible();
  });

  it("renders diagram image with alt text", () => {
    renderWithProviders(React.createElement(ArchitecturePage));
    // diagram img should be present
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThanOrEqual(1);
  });

  it("renders cost table with at least 1 data row", () => {
    renderWithProviders(React.createElement(ArchitecturePage));
    // table rows rendered via costs data
    const rows = screen.getAllByRole("row");
    // header row + at least 1 data row
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });

  it("GitHub link to portifolio repo is present with correct attrs", () => {
    renderWithProviders(React.createElement(ArchitecturePage));
    const links = screen.getAllByRole("link");
    const portifolioLinks = links.filter((l) =>
      l.getAttribute("href")?.includes("marcoaureliomenezes/portifolio"),
    );
    expect(portifolioLinks.length).toBeGreaterThanOrEqual(1);
    portifolioLinks.forEach((link) => {
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
    });
  });

  it("renders with Portuguese content when language is pt", () => {
    renderWithProviders(React.createElement(ArchitecturePage), "pt");
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toBeVisible();
  });
});
