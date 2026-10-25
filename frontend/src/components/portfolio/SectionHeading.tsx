import type { ReactNode } from "react";

/**
 * SectionHeading: the h2 that titles a home section.
 *
 * Input: the `id` the section's landmark points at, and the heading text.
 * Output: one `<h2>` in the label type step, uppercase, muted.
 * Side effects: none.
 */
export function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <h2
      id={id}
      className="text-label uppercase tracking-[0.1em] text-muted-foreground"
    >
      {children}
    </h2>
  );
}
