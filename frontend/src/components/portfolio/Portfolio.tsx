import { useContent } from "@/hooks/useContent";
import { HeroSection } from "./HeroSection";
import { ExperienceSection } from "./ExperienceSection";
import { EducationSection } from "./EducationSection";
import { CertificationsSection } from "./CertificationsSection";
import { SkillsSection } from "./SkillsSection";

interface PortfolioProps {
  /** @deprecated — language is now managed by LanguageContext / useContent().
   *  Prop is accepted for backward compatibility with Index.tsx and will be
   *  removed once Index.tsx is migrated in a follow-up task.
   */
  language?: string;
}

/**
 * Portfolio orchestrator — stateless, ≤ 80 lines, no useState.
 * All content is consumed via useContent(); no prop-drilling of language.
 * Each child component owns its own interactive state (collapsibles, etc.).
 */
export function Portfolio(_props: PortfolioProps = {}) {
  const { content, language } = useContent();

  return (
    <div className="container mx-auto px-4 pt-64 md:pt-32 pb-12 space-y-12 max-w-4xl md:ml-0">
      <HeroSection content={content} locale={language} />
      <ExperienceSection content={content} />
      <EducationSection content={content} />
      <CertificationsSection content={content} />
      <SkillsSection content={content} />
    </div>
  );
}
