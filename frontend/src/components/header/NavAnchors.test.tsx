/**
 * NavAnchors.test.tsx — unit tests for the mobile hamburger + desktop nav anchors.
 *
 * TDD: tests written BEFORE production code. They should fail on first run until
 * NavAnchors.tsx is implemented.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NavAnchors } from "./NavAnchors";
import type { SupportedLanguages } from "@/types/content";

// Polyfills for jsdom
if (typeof window.ResizeObserver === "undefined") {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </MemoryRouter>
  );
}

const noop = () => {};

function renderNavAnchors(language: SupportedLanguages = "en") {
  return render(
    <NavAnchors language={language} onLanguageChange={noop} />,
    { wrapper: Wrapper },
  );
}

describe("NavAnchors — desktop nav links", () => {
  it("renders desktop anchor links for experiencia, certificacoes, habilidades", async () => {
    const { container } = renderNavAnchors();
    // Desktop nav: links with href="#<anchor>"
    await screen.findByRole("navigation", { name: /section navigation/i });
    const links = container.querySelectorAll("nav a[href^='#']");
    const hrefs = Array.from(links).map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("#experiencia");
    expect(hrefs).toContain("#certificacoes");
    expect(hrefs).toContain("#habilidades");
  });
});

describe("NavAnchors — mobile hamburger", () => {
  it("renders a hamburger button with aria-expanded=false initially", async () => {
    renderNavAnchors();
    const btn = await screen.findByRole("button", { name: /menu/i });
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  it("hamburger button has minimum 44x44 touch target via min-h / min-w classes", async () => {
    renderNavAnchors();
    const btn = await screen.findByRole("button", { name: /menu/i });
    expect(btn.className).toMatch(/min-h-\[44px\]/);
    expect(btn.className).toMatch(/min-w-\[44px\]/);
  });

  it("hamburger button has aria-controls pointing to mobile-nav-drawer", async () => {
    renderNavAnchors();
    const btn = await screen.findByRole("button", { name: /menu/i });
    expect(btn).toHaveAttribute("aria-controls", "mobile-nav-drawer");
  });

  it("opens the Sheet drawer when hamburger is clicked", async () => {
    const user = userEvent.setup();
    renderNavAnchors();
    const btn = await screen.findByRole("button", { name: /menu/i });
    await user.click(btn);
    // Sheet should now contain anchor links
    const drawer = document.getElementById("mobile-nav-drawer");
    expect(drawer).not.toBeNull();
  });
});
