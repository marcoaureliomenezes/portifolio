import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project, ProjectKind } from "@/types/content";

function labelForKind(
  kind: ProjectKind,
  labels: { kindCaseStudy?: string; kindMeta?: string; kindGames?: string },
): string {
  if (kind === "case-study") return labels.kindCaseStudy ?? "Case study";
  if (kind === "meta") return labels.kindMeta ?? "Meta project";
  return labels.kindGames ?? "Games";
}

interface ProjectCardProps {
  project: Project;
  kindLabels: { kindCaseStudy?: string; kindMeta?: string; kindGames?: string };
}

export function ProjectCard({ project, kindLabels }: ProjectCardProps) {
  return (
    <Link
      to={`/projetos/${project.slug}`}
      className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl block"
    >
      <Card className="overflow-hidden h-full hover:-translate-y-1 hover:shadow-lg hover:border-amber-500/40 transition-all duration-200">
        {/* Cover image with gradient placeholder */}
        <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
          <img
            src={project.card.cover}
            alt={project.hero.title}
            width={640}
            height={360}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-start gap-2 flex-wrap">
            <CardTitle className="text-base leading-tight">{project.hero.title}</CardTitle>
            <Badge variant="outline" className="text-xs shrink-0">
              {labelForKind(project.kind, kindLabels)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">{project.card.summary}</p>
          <div className="flex flex-wrap gap-1.5">
            {project.card.tech.slice(0, 6).map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
