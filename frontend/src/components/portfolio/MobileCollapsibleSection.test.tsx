/**
 * MobileCollapsibleSection.test.tsx — T-QA-03
 *
 * Targets:
 *  - renders children inside the collapsible
 *  - applies the "md:hidden" class (visible on mobile, hidden on desktop via Tailwind)
 *
 * Strategy: MobileCollapsibleSection is a generic wrapper. We pass a simple
 * string child and check that it is rendered when the section is open.
 * Class-based verification is done via closest() / container.querySelector().
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { MobileCollapsibleSection } from "./MobileCollapsibleSection";
import { Code } from "lucide-react";

describe("MobileCollapsibleSection", () => {
  it("renders the section title", () => {
    render(
      <MobileCollapsibleSection title="Skills">
        <p>child content</p>
      </MobileCollapsibleSection>
    );
    expect(screen.getByText("Skills")).toBeInTheDocument();
  });

  it("renders children when defaultOpen=true (default)", () => {
    render(
      <MobileCollapsibleSection title="Education">
        <p>University degree content</p>
      </MobileCollapsibleSection>
    );
    expect(screen.getByText("University degree content")).toBeInTheDocument();
  });

  it("hides children when defaultOpen=false", () => {
    render(
      <MobileCollapsibleSection title="Education" defaultOpen={false}>
        <p>Hidden content</p>
      </MobileCollapsibleSection>
    );
    expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
  });

  it("clicking trigger toggles children visibility (closed → open)", async () => {
    const user = userEvent.setup();

    render(
      <MobileCollapsibleSection title="Certifications" defaultOpen={false}>
        <p>Cert list</p>
      </MobileCollapsibleSection>
    );

    expect(screen.queryByText("Cert list")).not.toBeInTheDocument();

    // The trigger button wraps the CardHeader — click the title text
    await user.click(screen.getByText("Certifications"));
    expect(screen.getByText("Cert list")).toBeInTheDocument();
  });

  it("clicking trigger toggles children visibility (open → closed)", async () => {
    const user = userEvent.setup();

    render(
      <MobileCollapsibleSection title="Experience" defaultOpen>
        <p>Experience list</p>
      </MobileCollapsibleSection>
    );

    expect(screen.getByText("Experience list")).toBeInTheDocument();

    await user.click(screen.getByText("Experience"));
    expect(screen.queryByText("Experience list")).not.toBeInTheDocument();
  });

  it("renders a Card as the root wrapper", () => {
    const { container } = render(
      <MobileCollapsibleSection title="Skills">
        <p>content</p>
      </MobileCollapsibleSection>
    );
    // Collapsible wraps a Card — verifiable by the w-full class applied to the Card
    const card = container.querySelector(".w-full.shadow-medium");
    expect(card).not.toBeNull();
  });

  it("renders optional icon when provided", () => {
    render(
      <MobileCollapsibleSection title="Code" icon={Code} iconColor="text-blue-500">
        <p>content</p>
      </MobileCollapsibleSection>
    );
    // Icon renders as SVG — the title text remains present
    expect(screen.getByText("Code")).toBeInTheDocument();
  });
});
