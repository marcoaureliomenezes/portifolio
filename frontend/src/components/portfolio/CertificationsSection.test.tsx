import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CertificationsSection } from "./CertificationsSection";
import type { ContentData, Certification } from "@/types/content";

const baseContent = {
  certificationsTitle: "Certificações",
  certifications: [] as Certification[],
};

const cert = (over: Partial<Certification>): Certification => ({
  id: "c",
  name: "AWS Solutions Architect",
  issuer: "Amazon Web Services",
  category: "AWS",
  date: "Jan 2025",
  validity: "",
  level: "Associate",
  icon: "",
  link: "https://example.com/cert",
  description: "",
  priority: 1,
  ...over,
});

const renderWith = (certifications: Certification[]) =>
  render(
    <CertificationsSection
      content={{ ...baseContent, certifications } as unknown as ContentData}
    />,
  );

describe("CertificationsSection — flat list", () => {
  const certs = [
    cert({ id: "a", name: "AWS Solutions Architect", level: "Associate" }),
    cert({ id: "b", name: "Spark Developer", issuer: "Databricks", category: "Databricks", date: "Aug 2024", level: "Associate", link: "#" }),
    cert({ id: "c", name: "Azure Fundamentals", issuer: "Microsoft", category: "Azure", date: "Jan 2023", level: "Foundational" }),
  ];

  it("keeps section#certificacoes and its heading", () => {
    const { container } = renderWith(certs);
    expect(container.querySelector("section#certificacoes")).not.toBeNull();
    expect(container.querySelector("h2#certificacoes-heading")).toHaveTextContent("Certificações");
  });

  it("renders one ul of entries in content order", () => {
    const { container } = renderWith(certs);
    const lists = container.querySelectorAll("ul");
    expect(lists).toHaveLength(1);
    const items = within(lists[0] as HTMLElement).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("AWS Solutions Architect · Associate");
    expect(items[1]).toHaveTextContent("Spark Developer · Associate");
    expect(items[2]).toHaveTextContent("Azure Fundamentals · Foundational");
  });

  it("shows a mono issuer · date line, fields verbatim", () => {
    renderWith(certs);
    const line = screen.getByText("Databricks · Aug 2024");
    expect(line.className).toMatch(/font-mono/);
  });

  it("has no grouping, badge images or cards", () => {
    const { container } = renderWith(certs);
    expect(container.querySelectorAll("img")).toHaveLength(0);
    expect(container.querySelectorAll("h3")).toHaveLength(0);
    expect(container.querySelector("[data-testid^='cert-grid']")).toBeNull();
    expect(container.querySelector(".bg-card, .rounded-xl")).toBeNull();
  });

  it("links the credential only when link is not #", () => {
    const { container } = renderWith(certs);
    const hrefs = Array.from(container.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["https://example.com/cert", "https://example.com/cert"]);
    expect(container.querySelector("a")).toHaveAttribute("target", "_blank");
    expect(container.querySelector("a")).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("CertificationsSection — i18n", () => {
  it("titles the section from certificationsTitle", () => {
    const { container } = render(
      <CertificationsSection
        content={{ ...baseContent, certificationsTitle: "Certifications", certifications: [cert({})] } as unknown as ContentData}
      />,
    );
    expect(container.querySelector("h2#certificacoes-heading")).toHaveTextContent("Certifications");
  });
});
