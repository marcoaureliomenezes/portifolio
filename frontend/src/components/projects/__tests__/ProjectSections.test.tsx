/**
 * ProjectSections.test.tsx — T-PC-C-02
 *
 * TDD: written before the component exists.
 * Tests:
 *  1. Renders each section title as h2
 *  2. Renders body text for plain sections
 *  3. Renders key-value items in a dl when section.items is present
 *  4. Renders nothing when sections array is empty
 *  5. One flat Block per section: media, code with a copy button, linked items
 */

import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { ProjectSections } from "../ProjectSections";
import type { ContentData, ProjectSectionData } from "@/types/content";
import { LanguageContext } from "@/contexts/LanguageContext";
import { track } from "@dadaia/analytics-sdk";

vi.mock("@dadaia/analytics-sdk", () => ({ track: vi.fn() }));

const writeText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  writeText.mockClear();
  vi.mocked(track).mockClear();
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => vi.unstubAllGlobals());

const content = {
  libraryPage: { copyLabel: "Copy", copiedLabel: "Copied" },
} as unknown as ContentData;

function renderSections(sections: ProjectSectionData[]) {
  return render(
    <LanguageContext.Provider
      value={{ language: "en", setLanguage: () => undefined, content, isLoading: false }}
    >
      <ProjectSections sections={sections} slug="test-project" />
    </LanguageContext.Provider>,
  );
}

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

describe("ProjectSections — Block", () => {
  const full: ProjectSectionData[] = [
    {
      id: "full",
      title: "Full",
      body: "Body text.",
      media: {
        type: "svg",
        alt: "scene",
        light: "/m/s-light.svg",
        dark: "/m/s-dark.svg",
      },
      code: "print('hi')",
      items: [
        { label: "Docs", value: "Read", href: "https://docs.example.com" },
        { label: "License", value: "MIT" },
      ],
    },
  ];

  it("renders body, media, code and items in that order inside one section", () => {
    renderSections(full);
    const section = screen.getByTestId("project-section");
    const order = [
      within(section).getByRole("heading", { level: 2, name: "Full" }),
      within(section).getByText("Body text."),
      within(section).getByTestId("diagram-light"),
      within(section).getByText("print('hi')"),
      within(section).getByText("License"),
    ];
    order.slice(1).forEach((el, i) => {
      expect(
        order[i].compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

  it("copies exactly the section code and tracks nothing", async () => {
    renderSections(full);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText).toHaveBeenCalledWith("print('hi')");
    expect(track).not.toHaveBeenCalled();
  });

  it("links an item value only when it has an href", () => {
    renderSections(full);
    const link = screen.getByRole("link", { name: "Read" });
    expect(link.getAttribute("href")).toBe("https://docs.example.com");
    expect(screen.queryByRole("link", { name: "MIT" })).toBeNull();
    expect(screen.getByText("MIT")).toBeTruthy();
  });

  it("renders flat: no boxed node, no shadow, no disclosure", () => {
    renderSections(full);
    const section = screen.getByTestId("project-section");
    for (const el of [section, ...Array.from(section.querySelectorAll("*"))]) {
      const tokens = Array.from(el.classList);
      const boxed =
        tokens.some((t) => t.startsWith("rounded")) &&
        tokens.some((t) => t === "border" || t.startsWith("border-"));
      expect(boxed).toBe(false);
      expect(tokens.some((t) => t.startsWith("shadow"))).toBe(false);
    }
    expect(section.querySelector("[aria-expanded]")).toBeNull();
  });
});
