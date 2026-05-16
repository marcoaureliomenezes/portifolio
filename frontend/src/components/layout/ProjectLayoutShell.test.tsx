/**
 * ProjectLayoutShell.test.tsx — T-FE-QUAL-04
 *
 * Criteria:
 *  - Renders <header> landmark (HeaderShell) when shell is active
 *  - Renders a back-link to "/" with visible "back to home" text
 *  - Renders child content injected via Outlet (mock route)
 *  - Back-link has a meaningful aria-label
 *  - Labels change according to the active language (pt / de)
 *
 * Strategy:
 *  - Wrap in MemoryRouter + Routes to drive Outlet rendering
 *  - LanguageProvider supplies i18n context
 *  - matchMedia is mocked (HeaderShell → useIsMobile)
 *  - ResizeObserver is polyfilled (shadcn internals)
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ProjectLayoutShell from "./ProjectLayoutShell";

// --------------------------------------------------------------------------
// jsdom polyfills
// --------------------------------------------------------------------------
if (typeof window.ResizeObserver === "undefined") {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// --------------------------------------------------------------------------
// matchMedia mock — treats all queries as non-mobile (desktop)
// --------------------------------------------------------------------------
function installMatchMediaMock(isMobile = false) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: isMobile ? 375 : 1280,
  });

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: isMobile,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

/** A simple child component to verify Outlet renders child content. */
function ChildPage() {
  return <main data-testid="child-page">Child content</main>;
}

/** Render ProjectLayoutShell with a nested child route at the given language. */
function renderShell(language: "pt" | "en" | "de" = "en") {
  return render(
    <LanguageProvider initialLanguage={language}>
      <MemoryRouter initialEntries={["/projetos/test"]}>
        <Routes>
          <Route element={<ProjectLayoutShell />}>
            <Route path="/projetos/test" element={<ChildPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </LanguageProvider>,
  );
}

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe("ProjectLayoutShell — T-FE-QUAL-04", () => {
  beforeEach(() => {
    installMatchMediaMock(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a <header> landmark (HeaderShell is present)", () => {
    renderShell();
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders a back-link pointing to /", () => {
    renderShell();
    // aria-label is the i18n label; text content also contains the label
    const link = screen.getByRole("link", { name: /back to home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders back-link with a non-empty aria-label", () => {
    renderShell();
    const link = screen.getByRole("link", { name: /back to home/i });
    const ariaLabel = link.getAttribute("aria-label");
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel!.length).toBeGreaterThan(0);
  });

  it("renders child content via Outlet", () => {
    renderShell();
    expect(screen.getByTestId("child-page")).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders Portuguese back-link label when language is pt", () => {
    renderShell("pt");
    // Portuguese: "Voltar para Home" — query by regex on aria-label
    const link = screen.getByRole("link", { name: /voltar/i });
    expect(link).toBeInTheDocument();
  });

  it("renders German back-link label when language is de", () => {
    renderShell("de");
    // German: "Zurück zur Startseite"
    const link = screen.getByRole("link", { name: /zurück/i });
    expect(link).toBeInTheDocument();
  });
});
