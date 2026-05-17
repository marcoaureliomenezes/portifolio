import { skillCategoryStyle } from "@/lib/skillCategoryColors";

interface RoleSkillBadgesProps {
  skills: string[];
}

/**
 * RoleSkillBadges — T-FE-WAVE6
 *
 * Renders a flex-wrap cluster of colored skill badges, each colorized by
 * category using skillCategoryStyle (from skillCategoryColors.ts).
 * Pure component: no state, no side effects.
 */
export function RoleSkillBadges({ skills }: RoleSkillBadgesProps) {
  if (skills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => {
        const style = skillCategoryStyle(skill);
        return (
          <span
            key={skill}
            data-testid="skill-badge"
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}
          >
            {skill}
          </span>
        );
      })}
    </div>
  );
}
