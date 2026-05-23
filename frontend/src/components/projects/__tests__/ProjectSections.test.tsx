/**
 * ProjectSections.test.tsx — T-PC-C-02
 *
 * TDD: written before the component exists.
 * Tests:
 *  1. Renders each section title as h2
 *  2. Renders body text for plain sections
 *  3. Renders key-value items in a dl when section.items is present
 *  4. Renders nothing when sections array is empty
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectSections } from "../ProjectSections";
import type { ProjectSectionData } from "@/types/content";

const basicSections: ProjectSectionData[] = [
  { id: "overview", title: "Overview", body: "This is the overview body." },
  { id: "engineering", title: "Engineering", body: "Engineering details here." },
];

const sectionsWithItems: ProjectSectionData[] = [
  {
    id: "status",
    title: "Status",
    items: [
      { label: "Phase", value: "Production" },
      { label: "Version", value: "1.0.0" },
    ],
  },
];

const slug = "test-project";

describe("ProjectSections — rendering", () => {
  it("renders each section title as h2", () => {
    render(<ProjectSections sections={basicSections} slug={slug} />);
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings.length).toBe(2);
    expect(headings[0].textContent).toBe("Overview");
    expect(headings[1].textContent).toBe("Engineering");
  });

  it("renders body text for plain sections", () => {
    render(<ProjectSections sections={basicSections} slug={slug} />);
    expect(screen.getByText("This is the overview body.")).toBeTruthy();
    expect(screen.getByText("Engineering details here.")).toBeTruthy();
  });

  it("renders key-value items in a dl when section.items is present", () => {
    render(<ProjectSections sections={sectionsWithItems} slug={slug} />);
    expect(screen.getByText("Phase")).toBeTruthy();
    expect(screen.getByText("Production")).toBeTruthy();
    expect(screen.getByText("Version")).toBeTruthy();
    expect(screen.getByText("1.0.0")).toBeTruthy();
  });

  it("renders nothing when sections array is empty", () => {
    const { container } = render(<ProjectSections sections={[]} slug={slug} />);
    expect(container.firstChild).toBeNull();
  });
});
