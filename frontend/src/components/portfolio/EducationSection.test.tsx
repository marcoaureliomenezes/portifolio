import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EducationSection } from "./EducationSection";
import type { ContentData } from "@/types/content";

const content = {
  educationTitle: "Educação",
  education: {
    degreeLevel: "B.Eng.",
    degreeField: "Control and Automation Engineering",
    institution: "Federal University of Ouro Preto",
    location: "Ouro Preto, MG",
    period: "2018",
    courseworkLabel: "Coursework",
    coursework: "Python, C/C++, embedded systems",
    thesisLabel: "Thesis",
    thesis: "Temperature Controllers for Electric Showers",
    thesisLink: "https://example.com/thesis",
  },
} as unknown as ContentData;

describe("EducationSection — one entry", () => {
  it("keeps section#educacao and its heading", () => {
    const { container } = render(<EducationSection content={content} />);
    expect(container.querySelector("section#educacao")).not.toBeNull();
    expect(container.querySelector("h2#educacao-heading")).toHaveTextContent("Educação");
  });

  it("shows degree, year, institution, coursework, then the thesis link, in order", () => {
    const { container } = render(<EducationSection content={content} />);
    const text = container.querySelector("section")!.textContent!;
    const at = ["Control and Automation Engineering", "2018", "Federal University of Ouro Preto", "Python, C/C++, embedded systems", "Temperature Controllers for Electric Showers"].map((s) => text.indexOf(s));
    expect(at.every((i) => i >= 0)).toBe(true);
    expect(at).toEqual([...at].sort((a, b) => a - b));
    const link = container.querySelector("a")!;
    expect(link).toHaveAttribute("href", "https://example.com/thesis");
    expect(link).toHaveTextContent("Temperature Controllers for Electric Showers");
    expect(container.querySelector("h3")!.textContent).toBe("B.Eng. Control and Automation Engineering");
    expect(container.textContent).toContain("Coursework: Python, C/C++, embedded systems");
    expect(container.textContent).toContain("Thesis: Temperature Controllers for Electric Showers");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("has no frame and no location chip", () => {
    const { container } = render(<EducationSection content={content} />);
    expect(container.textContent).not.toContain("Ouro Preto, MG");
    expect(container.querySelector(".bg-card, .rounded-xl, .border")).toBeNull();
  });
});
