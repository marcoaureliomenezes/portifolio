import { Download, ArrowDown, FolderKanban } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCvUrl } from "@/data/profile";
import type { ContentData, SupportedLanguages } from "@/types/content";

interface HeroSectionProps {
  content: ContentData;
  /** Active locale — used to resolve locale-keyed CV URL (T-FE-QUAL-10). */
  locale?: SupportedLanguages;
}

function scrollToExperience() {
  const target = document.getElementById("experiencia");
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  else window.location.hash = "#experiencia";
}

export function HeroSection({ content, locale = "pt" }: HeroSectionProps) {
  const tagline = content.heroTagline ?? content.resumeTitle;
  const stats = content.heroStats ?? { years: 5, certifications: 11, clouds: 4 };
  const ctas = content.heroCTAs ?? {
    downloadCv: "Download CV",
    seeExperience: "See experience",
    seeProjects: "See projects",
  };
  const seeProjectsLabel = ctas.seeProjects ?? "See projects";
  const statsSuffix = content.heroStatsSuffix ?? { years: "years", certs: "certs", clouds: "clouds" };
  const cvUrl = getCvUrl(locale);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden rounded-xl bg-card border border-border/40 shadow-medium p-6 md:p-10"
    >
      {/* Decorative dot-grid backdrop — width/height explicit to avoid CLS */}
      <img
        src="/decorators/dot-grid.svg"
        alt=""
        aria-hidden="true"
        width={400}
        height={400}
        className="pointer-events-none absolute -right-16 -bottom-16 w-[280px] md:w-[360px] opacity-30 select-none"
      />

      <div className="relative max-w-3xl space-y-5 md:space-y-6">
          <h1
            id="hero-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-foreground"
          >
            <span className="block">{tagline}</span>
            <span
              aria-hidden="true"
              className="inline-block mt-2 h-1 w-16 rounded-full bg-accent"
            />
          </h1>

          <p className="font-mono text-sm md:text-base text-foreground/80">
            <span className="font-bold text-foreground">{stats.years}+ {statsSuffix.years}</span>
            <span className="mx-2 text-border" aria-hidden="true">·</span>
            <span>{stats.certifications} {statsSuffix.certs}</span>
            <span className="mx-2 text-border" aria-hidden="true">·</span>
            <span>{stats.clouds} {statsSuffix.clouds}</span>
          </p>

          <p className={`text-foreground/80 leading-relaxed max-w-prose ${!isExpanded ? "line-clamp-3" : ""}`}>
            {isExpanded ? content.resume.full : content.resume.short}
          </p>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm font-semibold text-foreground underline hover:text-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            {isExpanded ? content.seeLess : content.seeMore}
          </button>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              asChild
              className="bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-accent"
            >
              <a href={cvUrl} download>
                <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                {ctas.downloadCv}
              </a>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={scrollToExperience}
              className="border-accent/50 hover:border-accent hover:bg-accent-subtle"
            >
              <ArrowDown className="w-4 h-4 mr-2" aria-hidden="true" />
              {ctas.seeExperience}
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-accent/50 hover:border-accent hover:bg-accent-subtle"
            >
              <Link to="/projetos" data-testid="hero-cta-projects">
                <FolderKanban className="w-4 h-4 mr-2" aria-hidden="true" />
                {seeProjectsLabel}
              </Link>
            </Button>
          </div>
      </div>
    </section>
  );
}
