/**
 * CertificationCard.test.tsx — T-RD-07 (AC-RD-05)
 *
 * The compact tile contract: badge + 2-line name + level chip + mono date;
 * the WHOLE tile is the credential link (single interactive element).
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CertificationCard } from "./CertificationCard";
import type { Certification } from "@/types/content";

const baseCert: Certification = {
  name: "AWS Data Engineer",
  issuer: "Amazon Web Services",
  category: "AWS",
  date: "December 2024",
  validity: "December 2027",
  level: "Associate",
  icon: "/images/badges/aws-dea.png",
  link: "https://www.credly.com/badges/x",
  description: "d",
  priority: 1,
};

describe("CertificationCard (tile)", () => {
  it("renders name, level chip and mono date", () => {
    render(<CertificationCard cert={baseCert} />);
    expect(screen.getByText("AWS Data Engineer")).toBeInTheDocument();
    expect(screen.getByText("Associate")).toBeInTheDocument();
    expect(screen.getByText("December 2024")).toBeInTheDocument();
  });

  it("the whole tile is the credential link — no nested button", () => {
    render(<CertificationCard cert={baseCert} />);
    const tile = screen.getByTestId("cert-tile");
    expect(tile.tagName).toBe("A");
    expect(tile.getAttribute("href")).toBe("https://www.credly.com/badges/x");
    expect(tile.getAttribute("rel")).toContain("noopener");
    expect(tile.querySelector("button")).toBeNull();
  });

  it("renders a non-link tile when the cert has no credential URL", () => {
    render(<CertificationCard cert={{ ...baseCert, link: "#" }} />);
    const tile = screen.getByTestId("cert-tile");
    expect(tile.tagName).toBe("DIV");
  });

  it("badge image is decorative (empty alt) — the name carries semantics", () => {
    render(<CertificationCard cert={baseCert} />);
    const img = screen.getByTestId("cert-tile").querySelector("img");
    expect(img?.getAttribute("alt")).toBe("");
  });
});
