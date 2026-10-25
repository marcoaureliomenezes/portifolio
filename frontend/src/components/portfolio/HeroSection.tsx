import { Download } from "lucide-react";
import { useState } from "react";
import { FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { PROSE } from "@/lib/layout";
import { yearsSince } from "@/lib/formatPeriod";
import profileAvatar from "@/assets/profile.webp";
import type { ContentData, SupportedLanguages } from "@/types/content";
import { track } from "@dadaia/analytics-sdk";

interface HeroSectionProps {
  content: ContentData;
  locale?: SupportedLanguages;
}

export function HeroSection({ content, locale = "pt" }: HeroSectionProps) {
  const tagline = content.heroTagline ?? content.resumeTitle;
  const ctas = content.heroCTAs ?? { downloadCv: "Download CV" };
  const suffix = content.heroStatsSuffix;
  const years = yearsSince(content.experiences.filter(e => e.type === "main").map(e => e.totalPeriod));
  const clouds = content.skills.find(s => s.id === "cloud-providers")?.skills.join(" · ");
  const stat = [`${years}+ ${suffix.years}`, `${content.certifications.length} ${suffix.certs}`, clouds].filter(Boolean).join(" · ");
  // T-RD-10: profile/CV come from content (admin-editable). locale kept for future per-locale CVs.
  void locale;
  const profile = content.profile;
  const cvUrl = profile.cvUrl;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section aria-labelledby="hero-heading" className="pt-6 pb-0">
      {/* Avatar + availability badge */}
      <div className="flex items-center gap-3 mb-6">
        <img
          src={profileAvatar}
          alt="Marco Aurelio Menezes"
          className="w-12 h-12 rounded-full object-cover object-top ring-2 ring-accent/40"
        />
        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-accent motion-safe:animate-pulse" />
          Marco Aurelio Menezes · Belo Horizonte, Brasil
        </span>
      </div>

      {/* H1 — single line on desktop, wraps on mobile */}
      {/* T-RD-02 + operator feedback 2026-06-11: compact headline (~70% smaller
          than the display scale), solid foreground, wraps — never truncates */}
      <h1
        id="hero-heading"
        className="text-hero font-bold leading-snug tracking-tight mb-4 text-foreground text-balance"
      >
        {tagline}
      </h1>

      <p className="font-mono text-sm text-muted-foreground mb-4">{stat}</p>

      <p className={`text-muted-foreground leading-relaxed ${PROSE} text-base md:text-lg mb-2 whitespace-pre-line`}>
        {content.resume.short}
      </p>
      {isExpanded && (
        <p className={`text-muted-foreground leading-relaxed ${PROSE} text-base md:text-lg mb-2 whitespace-pre-line`}>
          {content.resume.full}
        </p>
      )}
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm text-muted-foreground hover:text-foreground font-medium mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        {isExpanded ? content.storyClose : content.storyOpen}
      </button>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          asChild
          variant="outline"
          className="border-border hover:border-accent/60 hover:bg-accent/5 gap-2"
        >
          <a href={cvUrl} download onClick={() => track('cv_download')}>
            <Download className="w-4 h-4" aria-hidden="true" />
            {ctas.downloadCv}
          </a>
        </Button>
      </div>

      {/* Social links — brand colors always on, centered on mobile */}
      <div className="flex items-center justify-start gap-6 mt-5">
        {/* T-RD-02: monochrome socials — accent only on hover (single-accent system) */}
        <a
          href={profile.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="text-muted-foreground hover:text-accent transition-colors"
        >
          <FaLinkedin className="w-6 h-6" />
        </a>
        <a
          href={profile.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="text-muted-foreground hover:text-accent transition-colors"
        >
          <FaGithub className="w-6 h-6" />
        </a>
        <a
          href={profile.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="text-muted-foreground hover:text-accent transition-colors"
        >
          <FaInstagram className="w-6 h-6" />
        </a>
      </div>

      {/* Separator */}
      <div className="mt-8 h-px bg-border" aria-hidden="true" />
    </section>
  );
}
