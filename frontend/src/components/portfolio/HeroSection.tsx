import { Download, FolderKanban, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCvUrl } from "@/data/profile";
import profileAvatar from "@/assets/profile.webp";
import type { ContentData, SupportedLanguages } from "@/types/content";

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
    <section aria-labelledby="hero-heading" className="py-12 md:py-20">

      {/* Avatar + availability badge */}
      <div className="flex items-center gap-3 mb-8">
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

      {/* H1 — huge, bold, amber gradient on key phrase */}
      <h1
        id="hero-heading"
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-foreground mb-6"
      >
        {tagline.split("AI").length > 1 ? (
          <>
            {tagline.split("AI")[0]}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              AI
            </span>
            {tagline.split("AI")[1]}
          </>
        ) : (
          <>
            {tagline}
            <span className="block bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              at scale.
            </span>
          </>
        )}
      </h1>

      {/* Stats */}
      <p className="font-mono text-sm text-muted-foreground mb-6 flex flex-wrap gap-x-4 gap-y-1">
        <span><strong className="text-foreground">{stats.years}+</strong> {statsSuffix.years}</span>
        <span aria-hidden="true" className="text-border">·</span>
        <span><strong className="text-foreground">{stats.certifications}</strong> {statsSuffix.certs}</span>
        <span aria-hidden="true" className="text-border">·</span>
        <span><strong className="text-foreground">{stats.clouds}</strong> {statsSuffix.clouds}</span>
      </p>

      {/* Bio */}
      <p className={`text-muted-foreground leading-relaxed max-w-2xl text-base md:text-lg mb-2 ${!isExpanded ? "line-clamp-3" : ""}`}>
        {isExpanded ? content.resume.full : content.resume.short}
      </p>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm text-muted-foreground hover:text-foreground font-medium mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
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
          <a href={cvUrl} download>
            <Download className="w-4 h-4" aria-hidden="true" />
            {ctas.downloadCv}
          </a>
        </Button>
      </div>

      {/* Separator */}
      <div className="mt-16 h-px bg-border" aria-hidden="true" />
    </section>
  );
}
