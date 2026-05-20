/**
 * CostsTable.tsx — T-PC-C-02
 *
 * Renders `costs: CostRow[]` as a semantic <table> with a total row.
 * Returns null when costs is empty (caller should guard).
 *
 * Money formatted to 2 decimal places with $ prefix.
 * No shadcn Table component — plain semantic markup matches existing template style.
 */

import type { CostRow } from "@/types/content";

interface CostsTableProps {
  costs: CostRow[];
}

export function CostsTable({ costs }: CostsTableProps) {
  if (costs.length === 0) return null;

  const total = costs.reduce((sum, row) => sum + row.monthly_usd, 0);

  function formatUsd(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  return (
    <table data-testid="costs-table" className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          <th
            scope="col"
            className="text-left py-2 pr-4 text-muted-foreground font-medium"
          >
            Service
          </th>
          <th
            scope="col"
            className="text-right py-2 text-muted-foreground font-medium"
          >
            USD / month
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {costs.map((row) => (
          <tr key={row.service}>
            <td className="py-2 pr-4 text-foreground">{row.service}</td>
            <td className="py-2 text-right font-mono text-xs text-foreground">
              {formatUsd(row.monthly_usd)}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t-2 border-border font-semibold">
          <td className="py-2 pr-4 text-foreground">Total</td>
          <td className="py-2 text-right font-mono text-xs text-foreground">
            {formatUsd(total)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
