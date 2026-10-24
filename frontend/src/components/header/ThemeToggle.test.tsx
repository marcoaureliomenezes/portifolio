import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeToggle } from "./ThemeToggle";

type Locale = "pt" | "en" | "de";

function themeLabels(locale: Locale) {
  const file = resolve(process.cwd(), "public/content", `${locale}.json`);
  const chrome = JSON.parse(readFileSync(file, "utf-8")).siteChrome;
  expect(chrome, `siteChrome in ${locale}.json`).toBeDefined();
  return chrome.theme as { toLight: string; toDark: string };
}

async function renderToggle(locale: Locale = "pt") {
  const view = render(
    <LanguageProvider initialLanguage={locale}>
      <ThemeToggle />
    </LanguageProvider>,
  );
  await screen.findByRole("switch");
  return view;
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    window.localStorage.clear();
  });

  it("renders as a switch with aria-checked reflecting theme state", async () => {
    await renderToggle();
    const toggle = screen.getByRole("switch");
    expect(toggle).toBeInTheDocument();
    // Default theme is dark — aria-checked must be true
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("clicking toggles html.dark and persists to localStorage", async () => {
    const user = userEvent.setup();
    await renderToggle();

    const toggle = screen.getByRole("switch");
    // Initial state is dark; clicking once switches to light
    await user.click(toggle);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(window.localStorage.getItem("theme")).toBe("light");
  });

  it.each(["pt", "en", "de"] as const)(
    "%s: dark theme is labelled siteChrome.theme.toLight, light theme toDark",
    async (locale) => {
      const user = userEvent.setup();
      await renderToggle(locale);
      const labels = themeLabels(locale);
      expect(labels.toLight).not.toBe(labels.toDark);

      const toggle = screen.getByRole("switch");
      expect(toggle).toHaveAccessibleName(labels.toLight);
      await user.click(toggle);
      expect(toggle).toHaveAccessibleName(labels.toDark);
    },
  );

  it("en label differs from pt label", async () => {
    await renderToggle("en");
    expect(screen.getByRole("switch")).not.toHaveAccessibleName(themeLabels("pt").toLight);
  });
});
