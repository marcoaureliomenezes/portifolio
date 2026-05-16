/**
 * Header.test.tsx — T-QA-03 (updated T-FE-QUAL-02)
 *
 * Targets:
 *  - HeaderShell renders without crashing (smoke test)
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

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
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
  return React.createElement(LanguageProvider, { initialLanguage: "pt" }, children);
}

// --------------------------------------------------------------------------
// Import HeaderShell after polyfills are set up
// --------------------------------------------------------------------------
import { HeaderShell } from "./HeaderShell";

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe("HeaderShell", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders without crashing", () => {
    installMatchMediaMock(false);
    render(<HeaderShell />, { wrapper: Wrapper });
    // The header element itself should be present
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders the operator name", () => {
    installMatchMediaMock(false);
    render(<HeaderShell />, { wrapper: Wrapper });
    expect(screen.getByText("Marco Aurelio Menezes")).toBeInTheDocument();
  });

  it("on desktop (isMobile=false) desktop layout is rendered (hidden md:block)", () => {
    installMatchMediaMock(false);
    const { container } = render(<HeaderShell />, { wrapper: Wrapper });

    // HeaderDesktopLayout renders a div with class "hidden md:block"
    const desktopLayout = container.querySelector(".hidden.md\\:block");
    expect(desktopLayout).not.toBeNull();
  });

  it("on desktop (isMobile=false) mobile layout is NOT rendered", () => {
    installMatchMediaMock(false);
    const { container } = render(<HeaderShell />, { wrapper: Wrapper });

    // HeaderMobileLayout renders a div with class "block md:hidden"
    // When isMobile=false the branch is not rendered at all by HeaderShell
    const mobileLayout = container.querySelector(".block.md\\:hidden");
    expect(mobileLayout).toBeNull();
  });

  it("on mobile (isMobile=true) mobile layout is rendered (block md:hidden)", () => {
    installMatchMediaMock(true);
    const { container } = render(<HeaderShell />, { wrapper: Wrapper });

    // HeaderMobileLayout renders divs with "block md:hidden" class
    const mobileLayout = container.querySelector(".block.md\\:hidden");
    expect(mobileLayout).not.toBeNull();
  });

  it("on mobile (isMobile=true) desktop layout is NOT rendered", () => {
    installMatchMediaMock(true);
    const { container } = render(<HeaderShell />, { wrapper: Wrapper });

    const desktopLayout = container.querySelector(".hidden.md\\:block");
    expect(desktopLayout).toBeNull();
  });

  it("renders ThemeToggle (T-FE-WAVE1)", () => {
    installMatchMediaMock(false);
    render(<HeaderShell />, { wrapper: Wrapper });
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });
});
