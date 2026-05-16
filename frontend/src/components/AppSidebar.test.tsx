/**
 * AppSidebar.test.tsx — T-FE-QUAL-03
 *
 * Criteria:
 *  - Renders a <nav aria-label="primary"> (landmark preserved, T-FE-07)
 *  - Each SECTION_ANCHOR gets a button with visible label from useContent()
 *  - Clicking a button scrolls to the matching section and marks it aria-current="location"
 *  - No import from ui/sidebar (structural — checked by test isolation: component renders
 *    without SidebarProvider in the tree)
 *  - Component is hidden on small screens, visible on md+ (class check)
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";

// --------------------------------------------------------------------------
// ResizeObserver polyfill (used by shadcn internals in other imports)
// --------------------------------------------------------------------------
if (typeof window.ResizeObserver === "undefined") {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// --------------------------------------------------------------------------
// scrollTo mock (jsdom does not implement it)
// --------------------------------------------------------------------------
const scrollToMock = vi.fn();

// --------------------------------------------------------------------------
// Wrapper — LanguageProvider with Portuguese content
// --------------------------------------------------------------------------
function Wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(LanguageProvider, { initialLanguage: "pt" }, children);
}

import { AppSidebar } from "./AppSidebar";

describe("AppSidebar — T-FE-QUAL-03", () => {
  beforeEach(() => {
    window.scrollTo = scrollToMock;
    scrollToMock.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a <nav> with aria-label='primary'", () => {
    render(<AppSidebar />, { wrapper: Wrapper });
    expect(screen.getByRole("navigation", { name: /primary/i })).toBeInTheDocument();
  });

  it("renders all four section buttons", () => {
    render(<AppSidebar />, { wrapper: Wrapper });
    // Portuguese labels from pt.json: experienceTitle, educationTitle, certificationsTitle, skillsTitle
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(4);
  });

  it("no button has aria-current initially", () => {
    render(<AppSidebar />, { wrapper: Wrapper });
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).not.toHaveAttribute("aria-current");
    });
  });

  it("clicking a button sets aria-current='location' on that button", () => {
    // Create a mock target element so scrollToSection finds it
    const div = document.createElement("div");
    div.id = "experiencia";
    document.body.appendChild(div);

    render(<AppSidebar />, { wrapper: Wrapper });

    const buttons = screen.getAllByRole("button");
    // First button corresponds to "experiencia"
    fireEvent.click(buttons[0]!);

    expect(buttons[0]).toHaveAttribute("aria-current", "location");

    document.body.removeChild(div);
  });

  it("clicking a button calls window.scrollTo", () => {
    const div = document.createElement("div");
    div.id = "experiencia";
    document.body.appendChild(div);

    render(<AppSidebar />, { wrapper: Wrapper });
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]!);

    expect(scrollToMock).toHaveBeenCalledOnce();

    document.body.removeChild(div);
  });

  it("clicking a different button moves aria-current to the new button", () => {
    const div1 = document.createElement("div");
    div1.id = "experiencia";
    document.body.appendChild(div1);
    const div2 = document.createElement("div");
    div2.id = "educacao";
    document.body.appendChild(div2);

    render(<AppSidebar />, { wrapper: Wrapper });
    const buttons = screen.getAllByRole("button");

    fireEvent.click(buttons[0]!);
    expect(buttons[0]).toHaveAttribute("aria-current", "location");

    fireEvent.click(buttons[1]!);
    expect(buttons[1]).toHaveAttribute("aria-current", "location");
    expect(buttons[0]).not.toHaveAttribute("aria-current");

    document.body.removeChild(div1);
    document.body.removeChild(div2);
  });

  it("renders without requiring SidebarProvider in the tree", () => {
    // Render without any provider other than LanguageProvider — must not throw
    expect(() =>
      render(<AppSidebar />, { wrapper: Wrapper })
    ).not.toThrow();
  });

  it("nav has classes that hide on small screens and show on md+", () => {
    const { container } = render(<AppSidebar />, { wrapper: Wrapper });
    const nav = container.querySelector("nav");
    expect(nav?.className).toMatch(/hidden/);
    expect(nav?.className).toMatch(/md:/);
  });
});
