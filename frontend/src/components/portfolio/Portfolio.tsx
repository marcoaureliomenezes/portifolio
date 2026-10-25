import { useContent } from "@/hooks/useContent";
import { HeroSection } from "./HeroSection";
import { FeaturedProjects } from "./FeaturedProjects";
import { ExperienceSection } from "./ExperienceSection";
import { EducationSection } from "./EducationSection";
import { CertificationsSection } from "./CertificationsSection";
import { SkillsSection } from "./SkillsSection";

/**
 * Portfolio orchestrator — stateless, no useState.
 * All content is consumed via useContent(); no prop-drilling of language.
 * Each child component owns its own interactive state (collapsibles, etc.).
 *
 * Order: Hero → Experience → Projects → Skills → Certifications → Education.
 * The column width comes from SiteLayout.
 */
export function Portfolio() {
  const { content, language } = useContent();

  return (
    <div className="pb-8 space-y-6">
      <HeroSection content={content} locale={language} />
      <ExperienceSection content={content} locale={language} />
      <FeaturedProjects content={content} />
      <SkillsSection content={content} />
      <CertificationsSection content={content} />
      <EducationSection content={content} />
    </div>
  );
}
