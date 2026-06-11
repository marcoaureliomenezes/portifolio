/**
 * HeroNowPanel — T-RD-05 (AC-RD-01 support)
 *
 * The right column of the 2-col hero on lg+: a terminal-flavored "now" panel
 * that fills the above-the-fold dead space with live signal — current role,
 * latest certification, latest project. Entirely derived from content (no new
 * data source): experiences[0]/roles[0], certifications (priority 1 first),
 * and the first library project.
 *
 * Visual: mono type, card border, a "$ now" prompt line — the one place the
 * data-engineer terminal identity is allowed to show off, quietly.
 */

import { Link } from "react-router-dom";
import type { ContentData, ProjectsContentV2 } from "@/types/content";

interface HeroNowPanelProps {
  content: ContentData;
}

export function HeroNowPanel({ content }: HeroNowPanelProps) {
  const labels = content.nowPanel;
  const currentExp = content.experiences?.[0];
  const currentRole = currentExp?.roles?.[0];
  const latestCert = [...(content.certifications ?? [])].sort(
    (a, b) => a.priority - b.priority,
  )[0];
  const projectsV2 = content.projectsV2 as ProjectsContentV2 | undefined;
  const latestProject = projectsV2?.list?.find((p) => p.kind === "library");

  if (!currentRole && !latestCert && !latestProject) return null;

  return (
    <aside
      aria-label={labels?.title ?? "now"}
      data-testid="hero-now-panel"
      className="hidden lg:block rounded-xl border border-border/60 bg-card p-5 font-mono text-sm self-center w-full max-w-sm"
    >
      <p className="text-muted-foreground mb-4 select-none" aria-hidden="true">
        <span className="text-accent">$</span> {labels?.title ?? "now"}
      </p>
      <dl className="space-y-3">
        {currentRole && currentExp && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {labels?.currentRole ?? "papel atual"}
            </dt>
            <dd className="text-foreground mt-0.5">
              {currentRole.title} · {currentExp.company}
            </dd>
          </div>
        )}
        {latestCert && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {labels?.latestCert ?? "última certificação"}
            </dt>
            <dd className="text-foreground mt-0.5">{latestCert.name}</dd>
          </div>
        )}
        {latestProject && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {labels?.latestProject ?? "último projeto"}
            </dt>
            <dd className="mt-0.5">
              <Link
                to={`/projetos/${latestProject.slug}`}
                className="text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
              >
                {latestProject.hero.title}
              </Link>
            </dd>
          </div>
        )}
      </dl>
    </aside>
  );
}
