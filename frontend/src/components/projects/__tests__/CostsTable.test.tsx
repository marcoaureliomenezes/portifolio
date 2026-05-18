/**
 * CostsTable.test.tsx — T-PC-C-02
 *
 * TDD: written before the component exists.
 * Tests:
 *  1. Renders a table element
 *  2. Renders each cost row's service name
 *  3. Formats monthly_usd to 2 decimals with $ prefix
 *  4. Renders a total row summing all costs
 *  5. Renders nothing (null) when costs array is empty
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CostsTable } from "../CostsTable";
import type { CostRow } from "@/types/content";

const costs: CostRow[] = [
  { service: "Route53 hosted zone", monthly_usd: 0.5 },
  { service: "S3 storage", monthly_usd: 0.0 },
  { service: "CloudFront", monthly_usd: 0.0 },
];

describe("CostsTable — rendering", () => {
  it("renders a table element", () => {
    const { container } = render(<CostsTable costs={costs} />);
    const table = container.querySelector("table");
    expect(table).toBeTruthy();
  });

  it("renders each cost row service name", () => {
    render(<CostsTable costs={costs} />);
    expect(screen.getByText("Route53 hosted zone")).toBeTruthy();
    expect(screen.getByText("S3 storage")).toBeTruthy();
    expect(screen.getByText("CloudFront")).toBeTruthy();
  });

  it("formats monthly_usd to 2 decimals with $ prefix", () => {
    render(<CostsTable costs={costs} />);
    // Route53 has 0.5 → $0.50; this may appear also in total row
    const cells = screen.getAllByText("$0.50");
    expect(cells.length).toBeGreaterThanOrEqual(1);
  });

  it("renders a total row summing all costs", () => {
    const uniqueCosts: CostRow[] = [
      { service: "Route53", monthly_usd: 0.5 },
      { service: "EC2", monthly_usd: 10.0 },
    ];
    render(<CostsTable costs={uniqueCosts} />);
    // Total = 10.50
    expect(screen.getByText("$10.50")).toBeTruthy();
    expect(screen.getByText(/total/i)).toBeTruthy();
  });

  it("renders null when costs array is empty", () => {
    const { container } = render(<CostsTable costs={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
