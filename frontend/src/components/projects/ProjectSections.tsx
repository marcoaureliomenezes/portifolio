/**
 * ProjectSections — one flat `Block` per section: body, media, code, then
 * items as definition rows (value linked when `href` is set). Renders nothing
 * for an empty list; copy labels come from `content.libraryPage`.
 */

import { useContent } from "@/hooks/useContent";
import type { ProjectSectionData } from "@/types/content";
import { Block } from "./Block";
import { CodeBlock } from "./CodeBlock";
import { Media } from "./Media";

interface ProjectSectionsProps {
  sections: ProjectSectionData[];
  slug: string;
  scene?: boolean;
}

export function ProjectSections({ sections, slug, scene }: ProjectSectionsProps) {
  const { content } = useContent();
  if (sections.length === 0) return null;

  return (
    <>
      {sections.map(({ id, title, body, media, code, items }) => (
        <Block
          key={id}
          id={`${slug}-${id}-heading`}
          title={title}
          scene={scene}
          aside={scene && media ? <Media media={media} /> : undefined}
        >
          {body && (
            <p className="max-w-[680px] text-muted-foreground leading-relaxed whitespace-pre-line">{body}</p>
          )}
          {!scene && media && <Media media={media} />}
          {code && (
            <CodeBlock
              code={code}
              copyLabel={content.libraryPage?.copyLabel ?? ""}
              copiedLabel={content.libraryPage?.copiedLabel ?? ""}
            />
          )}
          {items && (
            <dl className="divide-y divide-border">
              {items.map(({ label, value, href }) => (
                <div key={label} className="py-3 flex justify-between gap-4">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-foreground">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4"
                      >
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Block>
      ))}
    </>
  );
}
