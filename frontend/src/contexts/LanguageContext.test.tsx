/**
 * LanguageContext.test.tsx — T-FE-QUAL-07 (updated T-PC-B-08)
 *
 * Tests for localStorage persistence in LanguageProvider.
 *
 * T-PC-B-08 update: LanguageProvider now loads content asynchronously.
 * It renders `null` until the first locale is loaded (option b). Tests
 * must use `waitFor` to assert after the async load settles.
 *
 * Scenarios:
 *   1. First visit (no localStorage) → falls back to navigator.language detection
 *   2. Return visit (localStorage["lang"] set) → localStorage value wins
 *   3. setLanguage() persists the chosen language to localStorage
 *   4. SSR-safe: no crash when window is unavailable (tested by mocking)
 */

import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import React, { useContext } from "react";
import { LanguageContext, LanguageProvider } from "./LanguageContext";
import type { SupportedLanguages } from "@/types/content";

// Helper: Consumer component to surface context values
function LanguageDisplay() {
  const { language, setLanguage } = useContext(LanguageContext);
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <button onClick={() => setLanguage("en")}>Set EN</button>
      <button onClick={() => setLanguage("de")}>Set DE</button>
      <button onClick={() => setLanguage("pt")}>Set PT</button>
    </div>
  );
}

describe("LanguageProvider — localStorage persistence (T-FE-QUAL-07)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // -------------------------------------------------------------------------
  // Scenario 1: First visit — no localStorage → falls back to navigator.language
  // -------------------------------------------------------------------------

  it("first visit with navigator.language='pt-BR' → language is 'pt'", async () => {
    localStorage.clear();
    Object.defineProperty(navigator, "language", {
      value: "pt-BR",
      configurable: true,
    });

    render(
      <LanguageProvider>
        <LanguageDisplay />
      </LanguageProvider>,
    );

    // Wait for async content load → children render.
    await waitFor(() => {
      expect(screen.getByTestId("lang").textContent).toBe("pt");
    });
  });

  it("first visit with navigator.language='en-US' → language is 'en'", async () => {
    localStorage.clear();
    Object.defineProperty(navigator, "language", {
      value: "en-US",
      configurable: true,
    });

    render(
      <LanguageProvider>
        <LanguageDisplay />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("lang").textContent).toBe("en");
    });
  });

  it("first visit with unknown navigator.language → falls back to 'pt'", async () => {
    localStorage.clear();
    Object.defineProperty(navigator, "language", {
      value: "ja-JP",
      configurable: true,
    });

    render(
      <LanguageProvider>
        <LanguageDisplay />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("lang").textContent).toBe("pt");
    });
  });

  // -------------------------------------------------------------------------
  // Scenario 2: Return visit — localStorage value wins over navigator.language
  // -------------------------------------------------------------------------

  it("return visit with localStorage['lang']='de' → language is 'de' regardless of navigator", async () => {
    localStorage.setItem("lang", "de");
    Object.defineProperty(navigator, "language", {
      value: "en-US",
      configurable: true,
    });

    render(
      <LanguageProvider>
        <LanguageDisplay />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("lang").textContent).toBe("de");
    });
  });

  it("return visit with localStorage['lang']='en' → language is 'en'", async () => {
    localStorage.setItem("lang", "en");

    render(
      <LanguageProvider>
        <LanguageDisplay />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("lang").textContent).toBe("en");
    });
  });

  // -------------------------------------------------------------------------
  // Scenario 3: setLanguage() persists to localStorage
  // -------------------------------------------------------------------------

  it("setLanguage('en') persists 'en' to localStorage", async () => {
    const user = userEvent.setup();
    localStorage.clear();

    render(
      <LanguageProvider>
        <LanguageDisplay />
      </LanguageProvider>,
    );

    // Wait for initial load before interacting.
    await waitFor(() => screen.getByRole("button", { name: "Set EN" }));

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Set EN" }));
    });

    await waitFor(() => {
      expect(localStorage.getItem("lang")).toBe("en");
      expect(screen.getByTestId("lang").textContent).toBe("en");
    });
  });

  it("setLanguage('de') persists 'de' to localStorage", async () => {
    const user = userEvent.setup();
    localStorage.clear();

    render(
      <LanguageProvider>
        <LanguageDisplay />
      </LanguageProvider>,
    );

    await waitFor(() => screen.getByRole("button", { name: "Set DE" }));

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Set DE" }));
    });

    await waitFor(() => {
      expect(localStorage.getItem("lang")).toBe("de");
    });
  });

  it("switching language updates localStorage (overwrite)", async () => {
    const user = userEvent.setup();
    localStorage.setItem("lang", "en");

    render(
      <LanguageProvider>
        <LanguageDisplay />
      </LanguageProvider>,
    );

    await waitFor(() => screen.getByRole("button", { name: "Set DE" }));

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Set DE" }));
    });

    await waitFor(() => {
      expect(localStorage.getItem("lang")).toBe("de");
    });
  });

  // -------------------------------------------------------------------------
  // Scenario 4: initialLanguage prop overrides both localStorage and navigator
  // -------------------------------------------------------------------------

  it("explicit initialLanguage prop overrides localStorage", async () => {
    localStorage.setItem("lang", "de");

    render(
      <LanguageProvider initialLanguage="en">
        <LanguageDisplay />
      </LanguageProvider>,
    );

    // initialLanguage prop is an explicit override — used as-is
    await waitFor(() => {
      expect(screen.getByTestId("lang").textContent).toBe("en");
    });
  });
});

// -------------------------------------------------------------------------
// SSR-safe guard: resolveInitialLanguage must not throw when localStorage
// is not accessible (e.g. in SSR or storage quota exceeded)
// -------------------------------------------------------------------------

describe("LanguageProvider — SSR window guard (T-FE-QUAL-07)", () => {
  it("does not throw when localStorage.getItem throws (e.g. SSR/quota)", async () => {
    const spy = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("localStorage unavailable");
      });

    expect(() => {
      render(
        <LanguageProvider>
          <LanguageDisplay />
        </LanguageProvider>,
      );
    }).not.toThrow();

    spy.mockRestore();
  });

  it("does not throw when localStorage.setItem throws (quota exceeded)", async () => {
    const user = userEvent.setup();
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

    render(
      <LanguageProvider>
        <LanguageDisplay />
      </LanguageProvider>,
    );

    // Wait for initial load before interacting.
    await waitFor(() => screen.getByRole("button", { name: "Set EN" }));

    await expect(
      act(async () => {
        await user.click(screen.getByRole("button", { name: "Set EN" }));
      }),
    ).resolves.not.toThrow();

    spy.mockRestore();
  });
});

// -------------------------------------------------------------------------
// resolveInitialLanguage pure-function tests (exported for unit testing)
// -------------------------------------------------------------------------

describe("resolveInitialLanguage (T-FE-QUAL-07)", () => {
  it("is exported and returns a SupportedLanguages value", async () => {
    const { resolveInitialLanguage } = await import("./LanguageContext");
    const result = resolveInitialLanguage();
    const valid: SupportedLanguages[] = ["pt", "en", "de"];
    expect(valid).toContain(result);
  });
});
