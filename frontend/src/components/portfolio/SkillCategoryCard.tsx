import { Globe, Code2, Cloud, Database, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SkillCategory } from "@/types/content";
import type { LucideIcon } from "lucide-react";
import { classifySkillCategory, skillCategoryStyle } from "@/lib/skillCategoryColors";
import { cn } from "@/lib/utils";

const ICON_MAP: Array<{ match: string[]; icon: LucideIcon }> = [
  { match: ["idioma", "language"], icon: Globe },
  { match: ["program", "linguagem"], icon: Code2 },
  { match: ["cloud"], icon: Cloud },
  { match: ["dados", "data"], icon: Database },
  { match: ["devops"], icon: Settings },
];

function resolveIcon(title: string): LucideIcon {
  const lower = title.toLowerCase();
  const found = ICON_MAP.find(({ match }) => match.some((m) => lower.includes(m)));
  return found?.icon ?? Code2;
}

interface SkillCategoryCardProps {
  skillCategory: SkillCategory;
  /** Pass `true` for the mobile variant (smaller sizes) */
  compact?: boolean;
}

export function SkillCategoryCard({ skillCategory, compact = false }: SkillCategoryCardProps) {
  const Icon = resolveIcon(skillCategory.title);
  const category = classifySkillCategory(skillCategory.title);
  const style = skillCategoryStyle(skillCategory.title);

  return (
    <div className="relative" data-category={category}>
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-full", style.dot)} />
      <div className="pl-8">
        <div
          className={cn(
            "bg-card rounded-xl border motion-safe:transition-all motion-safe:duration-200 hover:-translate-y-1 hover:shadow-large",
            style.border,
            compact ? "p-4" : "p-6",
          )}
        >
          <div className={`flex items-center gap-${compact ? "2" : "3"} mb-${compact ? "3" : "4"}`}>
            <Icon className={cn(compact ? "w-4 h-4" : "w-6 h-6", "text-foreground/70")} />
            <h3
              className={`${
                compact ? "text-sm" : "text-base md:text-xl"
              } font-bold text-foreground`}
            >
              {skillCategory.title}
            </h3>
          </div>
          <div className={`flex flex-wrap gap-${compact ? "1" : "2"}`}>
            {skillCategory.skills.map((skill, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className={cn(compact ? "text-xs" : "", style.badge)}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
