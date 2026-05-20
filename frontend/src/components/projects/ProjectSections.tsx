/**
 * ProjectSections.tsx — T-PC-C-02
 *
 * Renders the `sections: Array<ProjectSectionData>` block common to
 * CaseStudyProject and MetaProject. Heading hierarchy: page uses h1
 * (ProjectHero), sections use h2.
 *
 * Supports three section variants:
 *  - items present → definition list (key-value)
 *  - diagram present → image (plain img; DiagramAsset is used when caller has
 *    the dark variant — T-PC-C-06)
 *  - default → body text paragraph
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ProjectSectionData } from "@/types/content";

interface ProjectSectionsProps {
  sections: ProjectSectionData[];
  slug: string;
}

export function ProjectSections({ sections, slug }: ProjectSectionsProps) {
  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => {
        const headingId = `${slug}-${section.id}-heading`;

        // Key-value items section
        if (section.items) {
          return (
            <section key={section.id} aria-labelledby={headingId} data-testid="project-section">
              <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
                <CardHeader className="pb-2">
                  <h2
                    id={headingId}
                    className="text-lg md:text-2xl font-bold text-foreground"
                  >
                    {section.title}
                  </h2>
                </CardHeader>
                <CardContent>
                  <dl className="divide-y divide-border">
                    {section.items.map((item) => (
                      <div
                        key={item.label}
                        className="py-3 flex justify-between text-sm"
                      >
                        <dt className="text-muted-foreground font-medium">
                          {item.label}
                        </dt>
                        <dd className="text-foreground">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            </section>
          );
        }

        // Diagram section
        if (section.diagram) {
          return (
            <section key={section.id} aria-labelledby={headingId} data-testid="project-section">
              <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
                <CardHeader className="pb-2">
                  <h2
                    id={headingId}
                    className="text-lg md:text-2xl font-bold text-foreground"
                  >
                    {section.title}
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.body && (
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      {section.body}
                    </p>
                  )}
                  <img
                    src={section.diagram}
                    alt={`${section.title} diagram`}
                    className="w-full rounded-lg border border-border"
                    loading="lazy"
                  />
                </CardContent>
              </Card>
            </section>
          );
        }

        // Default: body text section
        return (
          <section key={section.id} aria-labelledby={headingId} data-testid="project-section">
            <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
              <CardHeader className="pb-2">
                <h2
                  id={headingId}
                  className="text-lg md:text-2xl font-bold text-foreground"
                >
                  {section.title}
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base whitespace-pre-line">
                  {section.body}
                </p>
              </CardContent>
            </Card>
          </section>
        );
      })}
    </>
  );
}
