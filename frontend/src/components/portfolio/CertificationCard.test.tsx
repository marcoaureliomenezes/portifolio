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

  it("starts compact and closed by default", () => {
    render(<CertificationCard cert={mockCert} labels={mockLabels} />);
    expect(screen.getByText("AWS Solutions Architect")).toBeInTheDocument();
    expect(screen.queryByText("Short cert description")).not.toBeInTheDocument();
    expect(screen.queryByText("Ver credencial")).not.toBeInTheDocument();
  });

  it("renders the issuer (provider)", () => {
    render(<CertificationCard cert={mockCert} labels={mockLabels} defaultOpen />);
    expect(screen.getByText(/Amazon Web Services/)).toBeInTheDocument();
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

  it("clicking credential button opens link with window.open (noopener)", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const user = userEvent.setup();

    render(<CertificationCard cert={mockCert} labels={mockLabels} defaultOpen />);
    await user.click(screen.getByText("Ver credencial"));

    expect(openSpy).toHaveBeenCalledWith(
      "https://aws.amazon.com/verify/cert-123",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("starts closed when defaultOpen=false and content is hidden", () => {
    render(<CertificationCard cert={mockCert} labels={mockLabels} defaultOpen={false} />);
    expect(screen.queryByText("Short cert description")).not.toBeInTheDocument();
  });

  it("toggle opens the card from closed state", async () => {
    const user = userEvent.setup();

    render(<CertificationCard cert={mockCert} labels={mockLabels} defaultOpen={false} />);
    expect(screen.queryByText("Short cert description")).not.toBeInTheDocument();

    const trigger = screen.getByRole("button", { name: /AWS Solutions Architect/i });
    await user.click(trigger);

    expect(screen.getByText("Short cert description")).toBeInTheDocument();
  });
});
