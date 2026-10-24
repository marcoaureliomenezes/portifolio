import type { ReactNode } from "react";

interface BlockProps {
  id: string;
  title: string;
  children: ReactNode;
}

export function Block({ id, title, children }: BlockProps) {
  return (
    <section aria-labelledby={id} data-testid="project-section" className="space-y-4">
      <h2 id={id} className="text-label text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}
