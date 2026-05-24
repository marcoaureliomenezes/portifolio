import { Download, FolderKanban, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
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

      {/* Avatar + availability badge */}
      <div className="flex items-center gap-3 mb-6">
        <img
          src={profileAvatar}
          alt="Marco Aurelio Menezes"
          className="w-12 h-12 rounded-full object-cover object-top ring-2 ring-accent/40"
        />
        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Marco Aurelio Menezes · Belo Horizonte, Brasil
        </span>
      </div>

      {/* H1 — single line on desktop, wraps on mobile */}
      <h1
        id="hero-heading"
        className="text-xl sm:text-2xl font-extrabold leading-tight tracking-tight mb-4 bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent sm:whitespace-nowrap sm:overflow-hidden sm:text-ellipsis"
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
        <a
          href={profile.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="text-[#0A66C2] hover:opacity-80 transition-opacity"
        >
          <FaLinkedin className="w-6 h-6" />
        </a>
        <a
          href={profile.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="text-foreground hover:opacity-80 transition-opacity"
        >
          <FaGithub className="w-6 h-6" />
        </a>
        <a
          href={profile.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="text-[#E1306C] hover:opacity-80 transition-opacity"
        >
          <FaInstagram className="w-6 h-6" />
        </a>
      </div>

      {/* Separator */}
      <div className="mt-8 h-px bg-border" aria-hidden="true" />
    </section>
  );
}
