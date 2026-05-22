/**
 * Header.test.tsx — T-QA-03 (updated T-PC-B-08)
 *
 * T-PC-B-08 update: LanguageProvider now loads content asynchronously.
 * Tests updated to use `waitFor` so assertions fire after content settles.
 *
 * Targets:
 *  - Header renders with minimal props (smoke test)
 *  - On desktop (isMobile=false) renders HeaderDesktopLayout (hidden md:block)
 *  - On mobile (isMobile=true) renders HeaderMobileLayout (block md:hidden)
 *  - Mock useIsMobile() for both cases
 *
 * Strategy:
 *  - LanguageProvider wraps render so useContent() has context
 *  - matchMedia is mocked to control useIsMobile return value
 *  - We do NOT test HeaderDesktopLayout / HeaderMobileLayout internals here —
 *    only that the right layout branch is taken (distinguished by class names
 *    applied by each layout component)
 */

import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";

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
// matchMedia mock helpers (mirrors use-mobile.test.tsx pattern)
// --------------------------------------------------------------------------

function installMatchMediaMock(isMobile: boolean) {
  const innerWidth = isMobile ? 375 : 1280;

  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: innerWidth,
  });

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: isMobile,
      media: query,
      listeners: new Set(),
      addEventListener(_type: string, _cb: () => void) {},
      removeEventListener(_type: string, _cb: () => void) {},
      dispatchEvent: vi.fn(),
    })),
  });
}

// --------------------------------------------------------------------------
// Wrapper
// --------------------------------------------------------------------------

function Wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(
    MemoryRouter,
    null,
    React.createElement(LanguageProvider, { initialLanguage: "pt" }, children),
  );
}

function wrapperAt(path: string, language: "pt" | "en" | "de" = "en") {
  return function RouteWrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      MemoryRouter,
      { initialEntries: [path] },
      React.createElement(LanguageProvider, { initialLanguage: language }, children),
    );
  };
}

// --------------------------------------------------------------------------
// Import Header after polyfills are set up
// --------------------------------------------------------------------------
import { Header } from "../Header";

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe("Header", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders without crashing with default props", async () => {
    installMatchMediaMock(false);
    render(<Header />, { wrapper: Wrapper });
    // Wait for LanguageProvider async load, then assert.
    await waitFor(() => {
      expect(screen.getByRole("banner")).toBeInTheDocument();
    });
  });

  it("renders the name passed as prop", async () => {
    installMatchMediaMock(false);
    render(<Header name="Test User" />, { wrapper: Wrapper });
    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });
  });

  it("on desktop (isMobile=false) desktop layout is rendered (hidden md:block)", async () => {
    installMatchMediaMock(false);
    const { container } = render(<Header />, { wrapper: Wrapper });

    // HeaderDesktopLayout renders a div with class "hidden md:block"
    await waitFor(() => {
      const desktopLayout = container.querySelector(".hidden.md\\:block");
      expect(desktopLayout).not.toBeNull();
    });
  });

  it("on desktop (isMobile=false) mobile layout is NOT rendered", async () => {
    installMatchMediaMock(false);
    const { container } = render(<Header />, { wrapper: Wrapper });

    // HeaderMobileLayout renders a div with class "block md:hidden"
    // When isMobile=false the branch is not rendered at all by HeaderShell
    await waitFor(() => {
      expect(container.querySelector(".hidden.md\\:block")).not.toBeNull();
    });
    const mobileLayout = container.querySelector(".block.md\\:hidden");
    expect(mobileLayout).toBeNull();
  });

  it("on mobile (isMobile=true) mobile layout is rendered (block md:hidden)", async () => {
    installMatchMediaMock(true);
    const { container } = render(<Header />, { wrapper: Wrapper });

    // HeaderMobileLayout renders divs with "block md:hidden" class
    await waitFor(() => {
      const mobileLayout = container.querySelector(".block.md\\:hidden");
      expect(mobileLayout).not.toBeNull();
    });
  });

  it("on mobile (isMobile=true) desktop layout is NOT rendered", async () => {
    installMatchMediaMock(true);
    const { container } = render(<Header />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(container.querySelector(".block.md\\:hidden")).not.toBeNull();
    });
    const desktopLayout = container.querySelector(".hidden.md\\:block");
    expect(desktopLayout).toBeNull();
  });

  it("accepts a language prop and passes it to HeaderShell", async () => {
    installMatchMediaMock(false);
    render(<Header language="en" />, { wrapper: Wrapper });
    await waitFor(() => {
      expect(screen.getByRole("banner")).toBeInTheDocument();
    });
  });

  it("accepts an onLanguageChange prop and renders without error", async () => {
    installMatchMediaMock(false);
    const spy = vi.fn();
    render(<Header language="pt" onLanguageChange={spy} />, { wrapper: Wrapper });
    await waitFor(() => {
      expect(screen.getByRole("banner")).toBeInTheDocument();
    });
  });

  it("renders ThemeToggle (T-FE-WAVE1)", async () => {
    installMatchMediaMock(false);
    render(<Header />, { wrapper: Wrapper });
    await waitFor(() => {
      expect(screen.getByRole("switch")).toBeInTheDocument();
    });
  });

  it("renders Personal Projects as active header nav on project routes", async () => {
    installMatchMediaMock(false);
    render(<Header language="en" />, { wrapper: wrapperAt("/projetos", "en") });
    const link = await screen.findByRole("link", { name: /Personal Projects/i });
    expect(link).toHaveAttribute("href", "/projetos");
    expect(link).toHaveAttribute("aria-current", "page");
  });
});
