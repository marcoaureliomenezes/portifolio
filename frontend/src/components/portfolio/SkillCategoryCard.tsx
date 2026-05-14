import { Globe, Code2, Cloud, Database, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SkillCategory } from "@/types/content";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Array<{ match: string[]; icon: LucideIcon; color: string }> = [
  { match: ["idioma", "language"], icon: Globe, color: "text-purple-600" },
  { match: ["program", "linguagem"], icon: Code2, color: "text-blue-600" },
  { match: ["cloud"], icon: Cloud, color: "text-sky-600" },
  { match: ["dados", "data"], icon: Database, color: "text-orange-600" },
  { match: ["devops"], icon: Settings, color: "text-green-600" },
];

function resolveIcon(title: string): { icon: LucideIcon; color: string } {
  const lower = title.toLowerCase();
  const found = ICON_MAP.find(({ match }) => match.some((m) => lower.includes(m)));
  return found ?? { icon: Code2, color: "text-blue-600" };
}

interface SkillCategoryCardProps {
  skillCategory: SkillCategory;
  /** Pass `true` for the mobile variant (smaller sizes) */
  compact?: boolean;
}

export function SkillCategoryCard({ skillCategory, compact = false }: SkillCategoryCardProps) {
  const { icon: Icon, color } = resolveIcon(skillCategory.title);

  return (
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />
      <div className="pl-8">
        <div
          className={`bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl border border-border/50 ${
            compact ? "p-4" : "p-6"
          }`}
        >
          <div className={`flex items-center gap-${compact ? "2" : "3"} mb-${compact ? "3" : "4"}`}>
            <Icon className={`${compact ? "w-4 h-4" : "w-6 h-6"} ${color}`} />
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
                className={`${
                  compact ? "text-xs" : ""
                } text-foreground bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-colors`}
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
