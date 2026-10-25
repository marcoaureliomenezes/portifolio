/**
 * Header.test.tsx — the one header: Resume and Projects links, theme toggle,
 * language selector, labels from the locale's `siteChrome` content.
 */

import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Header } from "../Header";

type Locale = "pt" | "en" | "de";

/** The locale's siteChrome block, read from the content file the app fetches. */
function chromeOf(locale: Locale) {
  const file = resolve(process.cwd(), "public/content", `${locale}.json`);
  const chrome = JSON.parse(readFileSync(file, "utf-8")).siteChrome;
  expect(chrome, `siteChrome in ${locale}.json`).toBeDefined();
  return chrome as {
    nav: { label: string; resume: string; projects: string };
    theme: { toLight: string; toDark: string };
    language: { label: string };
  };
}

async function renderHeader(path = "/", locale: Locale = "pt") {
  const view = render(
    <MemoryRouter initialEntries={[path]}>
      <LanguageProvider initialLanguage={locale}>
        <Header />
      </LanguageProvider>
    </MemoryRouter>,
  );
  await screen.findByRole("banner");
  return view;
}

describe("Header", () => {
  it("renders the banner with the brand name", async () => {
    await renderHeader();
    expect(screen.getByText("Marco Menezes")).toBeInTheDocument();
  });

  it("renders ThemeToggle", async () => {
    await renderHeader();
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("pt: Resume links to / and Projetos to /projetos", async () => {
    await renderHeader("/", "pt");
    const chrome = chromeOf("pt");
    expect(chrome.nav.projects).toBe("Projetos");
    expect(screen.getByRole("link", { name: chrome.nav.resume })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Projetos" })).toHaveAttribute("href", "/projetos");
  });

  it("en: Projects link is named Projects, Resume from siteChrome", async () => {
    await renderHeader("/", "en");
    const chrome = chromeOf("en");
    expect(chrome.nav.projects).toBe("Projects");
    expect(chrome.nav.resume).not.toBe(chromeOf("pt").nav.resume);
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/projetos");
    expect(screen.getByRole("link", { name: chrome.nav.resume })).toHaveAttribute("href", "/");
  });

  it("de: both links carry the de siteChrome labels", async () => {
    await renderHeader("/", "de");
    const chrome = chromeOf("de");
    expect(chrome.nav.projects).not.toBe("Projects");
    expect(screen.getByRole("link", { name: chrome.nav.projects })).toHaveAttribute("href", "/projetos");
    expect(screen.getByRole("link", { name: chrome.nav.resume })).toHaveAttribute("href", "/");
  });

  it.each([
    ["/", "resume"],
    ["/projetos", "projects"],
    ["/projetos/x", "projects"],
  ] as const)("on %s only the %s link is current", async (path, current) => {
    await renderHeader(path, "en");
    const resume = screen.getByRole("link", { name: chromeOf("en").nav.resume });
    const projects = screen.getByRole("link", { name: "Projects" });
    const [on, off] = current === "resume" ? [resume, projects] : [projects, resume];
    expect(on).toHaveAttribute("aria-current", "page");
    expect(off).not.toHaveAttribute("aria-current");
  });

  it("on an unknown path no link is current", async () => {
    await renderHeader("/nope", "en");
    for (const link of screen.getAllByRole("link")) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });

  it("has no Blog link, no in-page anchor and no menu button", async () => {
    const { container } = await renderHeader("/", "en");
    expect(screen.queryByRole("link", { name: /blog/i })).toBeNull();
    expect(container.querySelector('a[href^="#"]')).toBeNull();
    expect(container.querySelector('button[aria-label="Menu"]')).toBeNull();
  });

  it.each(["pt", "en", "de"] as const)(
    "%s: nav and control labels come from siteChrome",
    async (locale) => {
      await renderHeader("/", locale);
      const chrome = chromeOf(locale);
      expect(screen.getByRole("navigation", { name: chrome.nav.label })).toBeInTheDocument();
      expect(screen.getByRole("switch", { name: chrome.theme.toLight })).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: chrome.language.label })).toBeInTheDocument();
    },
  );

  it("pt nav aria-label is Navegação principal", async () => {
    await renderHeader("/", "pt");
    await waitFor(() =>
      expect(screen.getByRole("navigation", { name: "Navegação principal" })).toBeInTheDocument(),
    );
  });
});
