import type { ReactNode } from "react";

interface BlockProps {
  id: string;
  title: string;
  /** A scene: title and children left, `aside` right from `md`; stacked below. */
  scene?: boolean;
  aside?: ReactNode;
  children: ReactNode;
}

export function Block({ id, title, scene, aside, children }: BlockProps) {
  if (scene) {
    return (
      <section
        aria-labelledby={id}
        data-testid="project-section"
        className="space-y-4 md:space-y-0 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-9 md:items-center"
      >
        <div className="space-y-4">
          <h3 id={id} className="text-item text-primary">
            {title}
          </h3>
          {children}
        </div>
        {aside}
      </section>
    );
  }
  return (
    <section aria-labelledby={id} data-testid="project-section" className="space-y-4">
      <h2 id={id} className="text-label text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}
