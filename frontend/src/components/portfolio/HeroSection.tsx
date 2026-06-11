import { Download, FolderKanban, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { HeroNowPanel } from "./HeroNowPanel";
import { getCvUrl, profile } from "@/data/profile";
import profileAvatar from "@/assets/profile.webp";
import type { ContentData, SupportedLanguages } from "@/types/content";
import { track } from "@dadaia/analytics-sdk";

interface HeroSectionProps {
  content: ContentData;
  locale?: SupportedLanguages;
}

export function HeroSection({ content, locale = "pt" }: HeroSectionProps) {
  const tagline = content.heroTagline ?? content.resumeTitle;
  const stats = content.heroStats ?? { years: 5, certifications: 11, clouds: 4 };
  const ctas = content.heroCTAs ?? { downloadCv: "Download CV", seeProjects: "See projects" };
  const statsSuffix = content.heroStatsSuffix ?? { years: "years", certs: "certs", clouds: "clouds" };
  const cvUrl = getCvUrl(locale);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section aria-labelledby="hero-heading" className="pt-6 md:pt-10 pb-0">
      {/* T-RD-05: 2-col on lg+ — identity left, "now" panel right (fills the fold) */}
      <div className="lg:flex lg:items-center lg:gap-10">
      <div className="min-w-0 flex-1">

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
      {/* T-RD-02: display scale, solid foreground, wraps — never truncates */}
      <h1
        id="hero-heading"
        className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4 text-foreground text-balance"
      >
        {tagline}
      </h1>

      {/* Stats */}
      <p className="font-mono text-sm text-muted-foreground mb-4 flex flex-wrap gap-x-4 gap-y-1">
        <span><strong className="text-foreground">{stats.years}+</strong> {statsSuffix.years}</span>
        <span aria-hidden="true" className="text-border">·</span>
        <span><strong className="text-foreground">{stats.certifications}</strong> {statsSuffix.certs}</span>
        <span aria-hidden="true" className="text-border">·</span>
        <span><strong className="text-foreground">{stats.clouds}</strong> {statsSuffix.clouds}</span>
      </p>

      {/* Bio */}
      <p className={`text-muted-foreground leading-relaxed max-w-2xl text-base md:text-lg mb-2 whitespace-pre-line ${!isExpanded ? "line-clamp-3" : ""}`}>
        {isExpanded ? content.resume.full : content.resume.short}
      </p>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm text-muted-foreground hover:text-foreground font-medium mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        {isExpanded ? content.seeLess : content.seeMore}
      </button>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          asChild
          className="bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-accent gap-2"
        >
          <Link to="/projetos" data-testid="hero-cta-projects">
            <FolderKanban className="w-4 h-4" aria-hidden="true" />
            {ctas.seeProjects ?? "Ver projetos"}
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </Button>
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
      </div>

      {/* Right column — terminal "now" panel (lg+ only) */}
      <HeroNowPanel content={content} />
      </div>

      {/* Separator */}
      <div className="mt-8 h-px bg-border" aria-hidden="true" />
    </section>
  );
}
