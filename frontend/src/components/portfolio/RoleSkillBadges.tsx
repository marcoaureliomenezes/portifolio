import { Badge } from "@/components/ui/badge";
import { skillCategoryStyle } from "@/lib/skillCategoryColors";

interface RoleSkillBadgesProps {
  skills: string[];
}

export function RoleSkillBadges({ skills }: RoleSkillBadgesProps) {
  return (
    <div
      aria-label="Skills do cargo"
      role="list"
      className="flex flex-wrap gap-2"
    >
      {skills.map((skill) => (
        <Badge
          key={skill}
          role="listitem"
          variant="outline"
          className={skillCategoryStyle(skill).badge}
        >
          {skill}
        </Badge>
      ))}
    </div>
  );
}
