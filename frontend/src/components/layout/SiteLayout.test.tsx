import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LanguageContext, LanguageProvider } from "@/contexts/LanguageContext";
import type { ContentData } from "@/types/content";
import { SiteLayout } from "./SiteLayout";

// Boundary stub: the header's own contract lives in Header.test.tsx.
vi.mock("@/components/Header", () => ({
  Header: () => <header data-testid="site-header">header</header>,
}));

type Locale = "pt" | "en" | "de";
const LOCALES: Locale[] = ["pt", "en", "de"];

/** The committed locale file the app fetches: footer words and profile facts. */
function contentOf(locale: Locale) {
  const file = resolve(process.cwd(), "public/content", `${locale}.json`);
  return JSON.parse(readFileSync(file, "utf-8")) as {
    siteChrome: {
      footer: {
        label: string;
        owner: string;
        email: string;
        linkedin: string;
        github: string;
      };
    };
    profile: { email: string; linkedinUrl: string; githubUrl: string };
  };
}

/** Provider-less context value: only the required chrome and profile, read from the committed file. */
const { siteChrome, profile } = contentOf("pt");
const stubValue = {
  language: "pt" as const,
  setLanguage: () => undefined,
  content: { siteChrome, profile } as unknown as ContentData,
  isLoading: false,
};

function renderAt(path: string, locale?: Locale) {
  const routes = (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<div data-testid="page">home</div>} />
        <Route path="/projetos" element={<div data-testid="page">index</div>} />
        <Route
          path="/projetos/:slug"
          element={<div data-testid="page">detail</div>}
        />
        <Route path="*" element={<div data-testid="page">missing</div>} />
      </Route>
    </Routes>
  );
  return render(
    <MemoryRouter initialEntries={[path]}>
      {locale ? (
        <LanguageProvider initialLanguage={locale}>{routes}</LanguageProvider>
      ) : (
        <LanguageContext.Provider value={stubValue}>
          {routes}
        </LanguageContext.Provider>
      )}
    </MemoryRouter>,
  );
}

describe("SiteLayout", () => {
  it.each([
    ["/", "home"],
    ["/projetos", "index"],
    ["/projetos/x", "detail"],
    ["/nope/never", "missing"],
  ])(
    "%s renders one header and one main#main-content holding the outlet",
    (path, text) => {
      const { container } = renderAt(path);
      expect(container.querySelectorAll("header")).toHaveLength(1);
      const mains = container.querySelectorAll("main");
      expect(mains).toHaveLength(1);
      expect(mains[0].id).toBe("main-content");
      expect(mains[0].querySelector("main")).toBeNull();
      expect(mains[0].contains(screen.getByTestId("page"))).toBe(true);
      expect(screen.getByTestId("page").textContent).toBe(text);
      expect(mains[0].contains(container.querySelector("header"))).toBe(false);
    },
  );

  describe("footer and column", () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date("2031-03-01"));
    });
    afterEach(() => vi.useRealTimers());

    const ROUTES = ["/", "/projetos", "/projetos/x", "/nope/never"];
    const cases = LOCALES.flatMap((l) => ROUTES.map((p) => [l, p] as const));

    it.each(cases)(
      "%s %s: one footer after main with owner, year and contact links",
      async (locale, path) => {
        const { footer } = contentOf(locale).siteChrome;
        const { profile } = contentOf(locale);
        const { container } = renderAt(path, locale);
        const el = await screen.findByRole("contentinfo");
        expect(container.querySelectorAll("footer")).toHaveLength(1);
        const main = container.querySelector("main")!;
        expect(
          main.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
        expect(main.contains(el)).toBe(false);
        expect(el.getAttribute("aria-label")).toBe(footer.label);
        expect(el.textContent).toContain(footer.owner);
        expect(el.textContent).toContain("2031");
        const link = (text: string) => screen.getByRole("link", { name: text });
        expect(link(footer.email).getAttribute("href")).toBe(
          `mailto:${profile.email}`,
        );
        expect(link(footer.linkedin).getAttribute("href")).toBe(
          profile.linkedinUrl,
        );
        expect(link(footer.github).getAttribute("href")).toBe(
          profile.githubUrl,
        );
      },
    );

    it.each(ROUTES)(
      "%s: the outlet sits in a 960 px column inside main",
      async (path) => {
        const { container } = renderAt(path, "pt");
        await screen.findByRole("contentinfo");
        const column = screen.getByTestId("page").parentElement!;
        expect(column.className).toContain("max-w-[960px]");
        expect(container.querySelector("main")!.contains(column)).toBe(true);
      },
    );
  });
});
