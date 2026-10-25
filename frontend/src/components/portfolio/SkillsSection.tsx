import { Fragment } from "react";
import { SectionHeading } from "./SectionHeading";
import type { ContentData } from "@/types/content";

interface SkillsSectionProps {
  content: ContentData;
}

export function SkillsSection({ content }: SkillsSectionProps) {
  return (
    <section
      id="habilidades"
      aria-labelledby="habilidades-heading"
      className="motion-safe:animate-fade-up"
    >
      <SectionHeading id="habilidades-heading">{content.skillsTitle}</SectionHeading>
      <dl>
        {content.skills.map((category) => (
          <Fragment key={category.id}>
            <dt data-id={category.id} className="font-bold text-foreground">
              {category.title}
            </dt>
            <dd>{category.skills.join(" · ")}</dd>
          </Fragment>
        ))}
      </dl>
    </section>
  );
}
