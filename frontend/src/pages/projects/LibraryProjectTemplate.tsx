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
import { renderLibrary } from "@/lib/libraryRender";
import { PROSE } from "@/lib/layout";
import type { LibraryProject } from "@/types/content";

const FOLLOWING = ["try", "why", "facts"];

export function LibraryProjectTemplate({ project }: { project: LibraryProject }) {
  useDocumentSeo({ title: project.seo.title, description: project.seo.description });

  const { content } = useContent();
  const { slug, hero, pypi, links, sections } = renderLibrary(project);
  const labels = content.libraryPage;

  const scenes = sections.filter((s) => !FOLLOWING.includes(s.id));
  const following = FOLLOWING.flatMap((id) => sections.filter((s) => s.id === id)).map((s) =>
    s.id === "facts"
      ? { ...s, title: `${labels?.factsTitle} · ${hero.title} ${pypi.version}` }
      : s,
  );
  const link = (href: string, label: string | undefined) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-4"
    >
      {label}
    </a>
  );

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-title-sm md:text-title text-primary">{hero.title}</h1>
        <p className={`${PROSE} text-muted-foreground`}>{hero.tagline}</p>
        <div className="flex flex-wrap gap-4 text-meta">
          <span data-testid="library-version">
            {labels?.versionLabel} {pypi.version}
          </span>
          {link(links.repo, "GitHub")}
          {link(links.pypi, labels?.linkPypi)}
          {links.docs && link(links.docs, labels?.linkDocs)}
        </div>
        <CodeBlock
          code={pypi.installCommand}
          copyLabel={labels?.copyLabel || ""}
          copiedLabel={labels?.copiedLabel || ""}
          testIds={{ code: "install-command", button: "copy-install" }}
        />
      </header>
      {hero.media?.map((m, i) => <Media key={i} media={m} />)}
      {scenes.length > 0 && (
        <section aria-labelledby={`${slug}-how-heading`} className="space-y-10">
          <h2 id={`${slug}-how-heading`} className="text-label text-muted-foreground">
            {labels?.howTitle}
          </h2>
          {scenes.map(({ id, title, body, media }) => (
            <section
              key={id}
              aria-labelledby={`${slug}-${id}-heading`}
              data-testid="project-section"
              className="space-y-4 md:space-y-0 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-9 md:items-center"
            >
              <div className="space-y-4">
                <h3 id={`${slug}-${id}-heading`} className="text-item text-primary">
                  {title}
                </h3>
                {body && (
                  <p className={`${PROSE} text-muted-foreground leading-relaxed whitespace-pre-line`}>
                    {body}
                  </p>
                )}
              </div>
              {media?.length ? (
                <div className="space-y-4">
                  {media.map((m, i) => <Media key={i} media={m} />)}
                </div>
              ) : null}
            </section>
          ))}
        </section>
      )}
      <ProjectSections sections={following} slug={slug} />
    </div>
  );
}
