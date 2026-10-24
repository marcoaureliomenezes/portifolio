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
 * T-RD-06 order (recruiter scan: who → what → where → proof):
 * Hero → Featured Projects → Experience → Skills → Certifications → Education
 */
export function Portfolio() {
  const { content, language } = useContent();

  return (
    <div className="container mx-auto px-4 pt-16 md:pt-[72px] pb-8 space-y-6 max-w-5xl">
      <HeroSection content={content} locale={language} />
      <FeaturedProjects content={content} />
      <ExperienceSection content={content} />
      <SkillsSection content={content} />
      <CertificationsSection content={content} />
      <EducationSection content={content} />
    </div>
  );
}
