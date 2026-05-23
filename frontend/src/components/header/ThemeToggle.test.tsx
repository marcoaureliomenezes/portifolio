import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    window.localStorage.clear();
  });

  it("renders as a switch with aria-checked reflecting theme state", () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole("switch");
    expect(toggle).toBeInTheDocument();
    // Default theme is dark — aria-checked must be true
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("clicking toggles html.dark and persists to localStorage", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const toggle = screen.getByRole("switch");
    // Initial state is dark; clicking once switches to light
    await user.click(toggle);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(window.localStorage.getItem("theme")).toBe("light");
  });
});
