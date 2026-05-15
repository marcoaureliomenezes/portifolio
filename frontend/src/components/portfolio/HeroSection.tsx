import { Download, ArrowDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import profileAvatar from "@/assets/profile.png";
import { profile } from "@/data/profile";
import type { ContentData } from "@/types/content";

interface HeroSectionProps {
  content: ContentData;
}

function scrollToExperience() {
  const target = document.getElementById("experiencia");
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  else window.location.hash = "#experiencia";
}

export function HeroSection({ content }: HeroSectionProps) {
  const tagline = content.heroTagline ?? content.resumeTitle;
  const stats = content.heroStats ?? { years: 5, certifications: 11, clouds: 4 };
  const ctas = content.heroCTAs ?? { downloadCv: "Download CV", seeExperience: "See experience" };
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

      <div className="relative grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
        {/* Left — 60% on desktop */}
        <div className="md:col-span-3 space-y-6">
          <h1
            id="hero-heading"
            className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold leading-tight text-foreground"
          >
            <span className="block">{tagline}</span>
            <span
              aria-hidden="true"
              className="inline-block mt-2 h-1 w-16 rounded-full bg-accent"
            />
          </h1>

          <p className="font-mono text-sm md:text-base text-muted-foreground">
            <span className="text-accent font-semibold">{stats.years}+ years</span>
            <span className="mx-2 text-border">·</span>
            <span>{stats.certifications} certs</span>
            <span className="mx-2 text-border">·</span>
            <span>{stats.clouds} clouds</span>
          </p>

          <p className={`text-foreground/80 leading-relaxed max-w-prose ${!isExpanded ? "line-clamp-3" : ""}`}>
            {isExpanded ? content.resume.full : content.resume.short}
          </p>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            {isExpanded ? content.seeLess : content.seeMore}
          </button>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              asChild
              className="bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-accent"
            >
              <a href={profile.cvDownloadUrl} download>
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
          </div>
        </div>

        {/* Right — 40% on desktop, avatar + halo */}
        <div className="md:col-span-2 flex justify-center md:justify-end">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: "0 0 80px hsl(var(--accent) / 0.3)" }}
            />
            <img
              src={profileAvatar}
              alt="Marco Aurelio Menezes"
              width={192}
              height={192}
              loading="eager"
              fetchPriority="high"
              className="relative w-40 h-40 md:w-48 md:h-48 rounded-full object-cover object-top border-2 border-accent/40"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
