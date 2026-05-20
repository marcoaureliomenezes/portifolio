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

  it("img has correct alt text", () => {
    render(
      <DiagramAsset
        light="/diagrams/arch-light.svg"
        dark="/diagrams/arch-dark.svg"
        alt="Architecture diagram"
      />
    );
    const img = screen.getByRole("img");
    expect(img.getAttribute("alt")).toBe("Architecture diagram");
  });

  it("source element has dark media query", () => {
    const { container } = render(
      <DiagramAsset
        light="/diagrams/arch-light.svg"
        dark="/diagrams/arch-dark.svg"
        alt="Architecture diagram"
      />
    );
    const source = container.querySelector("source");
    expect(source?.getAttribute("media")).toBe("(prefers-color-scheme: dark)");
    expect(source?.getAttribute("srcset")).toBe("/diagrams/arch-dark.svg");
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

  it("when dark is omitted, source srcSet falls back to light", () => {
    const { container } = render(
      <DiagramAsset
        light="/diagrams/arch-light.svg"
        alt="Architecture diagram"
      />
    );
    const source = container.querySelector("source");
    expect(source?.getAttribute("srcset")).toBe("/diagrams/arch-light.svg");
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
