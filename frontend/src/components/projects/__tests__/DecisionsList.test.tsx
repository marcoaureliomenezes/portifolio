/**
 * DecisionsList.test.tsx — T-PC-C-02
 *
 * TDD: written before the component exists.
 * Tests:
 *  1. Renders each decision title as h3
 *  2. Renders rationale text for each decision
 *  3. Renders nothing when decisions array is empty
 *  4. Decision link (spec) opens in new tab with noopener noreferrer
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DecisionsList } from "../DecisionsList";
import type { ArchDecision } from "@/types/content";

const decisions: ArchDecision[] = [
  {
    title: "React/Vite instead of Next.js",
    rationale: "High ROI for 5 static routes.",
    spec: "https://github.com/example/specs",
  },
  {
    title: "OIDC without long-lived keys",
    rationale: "No persistent AWS secrets.",
    spec: "https://github.com/example/specs2",
  },
];

describe("DecisionsList — rendering", () => {
  it("renders each decision title as h3", () => {
    render(<DecisionsList decisions={decisions} />);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings.length).toBe(2);
    expect(headings[0].textContent).toContain("React/Vite instead of Next.js");
    expect(headings[1].textContent).toContain("OIDC without long-lived keys");
  });

  it("renders rationale text for each decision", () => {
    render(<DecisionsList decisions={decisions} />);
    expect(screen.getByText("High ROI for 5 static routes.")).toBeTruthy();
    expect(screen.getByText("No persistent AWS secrets.")).toBeTruthy();
  });

  it("renders nothing when decisions array is empty", () => {
    const { container } = render(<DecisionsList decisions={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("spec link opens in new tab with noopener noreferrer", () => {
    render(<DecisionsList decisions={decisions} />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(1);
    links.forEach((link) => {
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    });
  });
});
