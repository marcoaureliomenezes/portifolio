/**
 * LibraryProjectTemplate — an open-source library page, built from
 * `LibraryProject` only: title and purpose, meta row, install line, hero
 * media, the scenes, then `try`, `why` and `facts`. Every section is optional;
 * the shell owns the main landmark, breadcrumb and back link.
 */

import { useContent } from "@/hooks/useContent";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { CodeBlock } from "@/components/projects/CodeBlock";
import { Media } from "@/components/projects/Media";
import { ProjectSections } from "@/components/projects/ProjectSections";
import { track } from "@dadaia/analytics-sdk";
import type { LibraryProject } from "@/types/content";

const FOLLOWING = ["try", "why", "facts"];

export function LibraryProjectTemplate({ project }: { project: LibraryProject }) {
  useDocumentSeo({ title: project.seo.title, description: project.seo.description });

  const { content } = useContent();
  const { slug, hero, pypi, links, sections } = project;
  const labels = content.libraryPage;

  const scenes = sections.filter((s) => !FOLLOWING.includes(s.id));
  const following = FOLLOWING.flatMap((id) => sections.filter((s) => s.id === id)).map((s) =>
    s.id === "facts"
      ? { ...s, title: `${labels?.factsTitle} · ${hero.title} ${pypi.version}` }
      : s,
  );
  const link = (href: string, label: string | undefined, action?: string) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-4"
      onClick={action ? () => track("project_cta", { project: slug, action }) : undefined}
    >
      {label}
    </a>
  );

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-title-sm md:text-title text-primary">{hero.title}</h1>
        <p className="max-w-[680px] text-muted-foreground">{hero.tagline}</p>
        <div className="flex flex-wrap gap-4 text-meta">
          <span data-testid="library-version">
            {labels?.versionLabel} {pypi.version}
          </span>
          {link(links.repo, "GitHub", "github")}
          {link(links.pypi, labels?.linkPypi, "pypi")}
          {links.docs && link(links.docs, labels?.linkDocs)}
        </div>
        <CodeBlock
          code={pypi.installCommand}
          copyLabel={labels?.copyLabel || ""}
          copiedLabel={labels?.copiedLabel || ""}
          onCopy={() => track("project_cta", { project: slug, action: "copy_install" })}
          testIds={{ code: "install-command", button: "copy-install" }}
        />
      </header>
      {hero.media && <Media media={hero.media} />}
      {scenes.length > 0 && (
        <section aria-labelledby={`${slug}-how-heading`} className="space-y-10">
          <h2 id={`${slug}-how-heading`} className="text-label text-muted-foreground">
            {labels?.howTitle}
          </h2>
          <ProjectSections sections={scenes} slug={slug} scene />
        </section>
      )}
      <ProjectSections sections={following} slug={slug} />
    </div>
  );
}
