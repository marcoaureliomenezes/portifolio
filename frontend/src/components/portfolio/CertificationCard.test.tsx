/**
 * CertificationCard.test.tsx — T-QA-03
 *
 * Targets:
 *  - renders title (cert.name), provider (cert.issuer), and date (cert.date)
 *  - external credential link has target=_blank and rel=noopener (via window.open mock)
 *
 * Strategy: CertificationCard uses Radix Collapsible.  defaultOpen=true exposes
 * the full content in the initial render so we can inspect all fields without
 * needing a user interaction.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CertificationCard } from "./CertificationCard";
import type { Certification, ContentData } from "@/types/content";

const mockCert: Certification = {
  name: "AWS Solutions Architect",
  issuer: "Amazon Web Services",
  category: "Cloud",
  date: "2023-06",
  validity: "2026-06",
  level: "Associate",
  icon: "",
  link: "https://aws.amazon.com/verify/cert-123",
  description: "Short cert description",
  priority: 1,
};

const mockLabels: Pick<ContentData, "validUntil" | "viewCredential" | "issuerLabel" | "seeMore" | "seeLess"> = {
  validUntil: "Válido até",
  viewCredential: "Ver credencial",
  issuerLabel: "Emissor",
  seeMore: "Ver mais",
  seeLess: "Ver menos",
};

describe("CertificationCard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the certification name", () => {
    render(<CertificationCard cert={mockCert} labels={mockLabels} defaultOpen />);
    expect(screen.getByText("AWS Solutions Architect")).toBeInTheDocument();
  });

  it("flat card always shows credential link when cert.link is valid", () => {
    render(<CertificationCard cert={mockCert} labels={mockLabels} />);
    expect(screen.getByText("AWS Solutions Architect")).toBeInTheDocument();
    expect(screen.queryByText("Short cert description")).not.toBeInTheDocument();
    expect(screen.getByText("Ver credencial")).toBeInTheDocument();
  });

  it("credential link has correct href and security attributes", () => {
    render(<CertificationCard cert={mockCert} labels={mockLabels} defaultOpen />);
    const link = screen.getByRole("link", { name: /ver credencial/i });
    expect(link).toHaveAttribute("href", "https://aws.amazon.com/verify/cert-123");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the certification date", () => {
    render(<CertificationCard cert={mockCert} labels={mockLabels} defaultOpen />);
    expect(screen.getByText("2023-06")).toBeInTheDocument();
  });

  it("renders the cert level badge", () => {
    render(<CertificationCard cert={mockCert} labels={mockLabels} defaultOpen />);
    expect(screen.getByText("Associate")).toBeInTheDocument();
  });

  it("credential button is present when cert.link is valid", () => {
    render(<CertificationCard cert={mockCert} labels={mockLabels} defaultOpen />);
    expect(screen.getByText("Ver credencial")).toBeInTheDocument();
  });

  it("credential button does NOT appear when cert.link is '#'", () => {
    const certNoLink: Certification = { ...mockCert, link: "#" };
    render(<CertificationCard cert={certNoLink} labels={mockLabels} defaultOpen />);
    expect(screen.queryByText("Ver credencial")).not.toBeInTheDocument();
  });

  it("credential link uses anchor (not window.open) with noopener noreferrer", () => {
    render(<CertificationCard cert={mockCert} labels={mockLabels} defaultOpen />);
    const link = screen.getByRole("link", { name: /ver credencial/i });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("starts closed when defaultOpen=false and content is hidden", () => {
    render(<CertificationCard cert={mockCert} labels={mockLabels} defaultOpen={false} />);
    expect(screen.queryByText("Short cert description")).not.toBeInTheDocument();
  });

  it("flat card renders cert name and level without any toggle trigger", () => {
    render(<CertificationCard cert={mockCert} labels={mockLabels} defaultOpen={false} />);
    expect(screen.getByText("AWS Solutions Architect")).toBeInTheDocument();
    expect(screen.getByText("Associate")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /AWS Solutions Architect/i })).not.toBeInTheDocument();
  });
});
