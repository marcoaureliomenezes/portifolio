/**
 * DiagramAsset.test.tsx — T-PC-C-02 / T-PC-C-06
 *
 * TDD: written before the component exists.
 * Tests:
 *  1. Renders <picture> with <source> for dark mode when both props provided
 *  2. Default <img> has src=light and alt attribute
 *  3. Renders aria-hidden placeholder div when light/dark are empty strings
 *  4. Renders figcaption with alt text in placeholder mode
 *  5. source element has correct media attribute
 *  6. When dark is omitted, source srcSet falls back to light
 *  7. When dark is omitted, img src is still light
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DiagramAsset } from "../DiagramAsset";

describe("DiagramAsset — rendering", () => {
  it("renders img with src=light when props are provided", () => {
    const { container } = render(
      <DiagramAsset
        light="/diagrams/arch-light.svg"
        dark="/diagrams/arch-dark.svg"
        alt="Architecture diagram"
      />
    );
    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toBe("/diagrams/arch-light.svg");
  });

  it("img has correct alt text (both variants)", () => {
    render(
      <DiagramAsset
        light="/diagrams/arch-light.svg"
        dark="/diagrams/arch-dark.svg"
        alt="Architecture diagram"
      />
    );
    const imgs = screen.getAllByRole("img");
    expect(imgs).toHaveLength(2);
    for (const img of imgs) {
      expect(img.getAttribute("alt")).toBe("Architecture diagram");
    }
  });

  // T-PC2-R2-05 / AC-PC2-R2-04: variant switching is class-based (html.dark),
  // NOT prefers-color-scheme — the manual theme toggle must control it.
  it("renders theme-aware variants via dark: classes, no <source media>", () => {
    const { container } = render(
      <DiagramAsset
        light="/diagrams/arch-light.svg"
        dark="/diagrams/arch-dark.svg"
        alt="Architecture diagram"
      />
    );
    expect(container.querySelector("source")).toBeNull();
    const lightImg = screen.getByTestId("diagram-light");
    const darkImg = screen.getByTestId("diagram-dark");
    expect(lightImg.getAttribute("src")).toBe("/diagrams/arch-light.svg");
    expect(lightImg.className).toContain("dark:hidden");
    expect(darkImg.getAttribute("src")).toBe("/diagrams/arch-dark.svg");
    expect(darkImg.className).toContain("hidden");
    expect(darkImg.className).toContain("dark:block");
  });

  it("renders placeholder div with aria-hidden when light is empty string", () => {
    const { container } = render(
      <DiagramAsset light="" dark="" alt="Architecture diagram" />
    );
    const placeholder = container.querySelector("[aria-hidden='true']");
    expect(placeholder).toBeTruthy();
    // No broken img rendered
    const img = container.querySelector("img");
    expect(img).toBeNull();
  });

  it("renders figcaption with alt text in placeholder mode", () => {
    render(<DiagramAsset light="" dark="" alt="Architecture diagram" />);
    expect(screen.getByText("Architecture diagram")).toBeTruthy();
  });

  it("when dark is omitted, renders a single light img (no variant pair)", () => {
    const { container } = render(
      <DiagramAsset
        light="/diagrams/arch-light.svg"
        alt="Architecture diagram"
      />
    );
    const imgs = container.querySelectorAll("img");
    expect(imgs).toHaveLength(1);
    expect(container.querySelector("[data-testid='diagram-dark']")).toBeNull();
  });

  it("when dark is omitted, img src is still light", () => {
    const { container } = render(
      <DiagramAsset
        light="/diagrams/arch-light.svg"
        alt="Architecture diagram"
      />
    );
    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toBe("/diagrams/arch-light.svg");
  });
});
