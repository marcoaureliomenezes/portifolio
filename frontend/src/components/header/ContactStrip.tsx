import { Github, Linkedin, Download } from "lucide-react";
import type { SupportedLanguages } from "@/types/content";
import { profile } from "@/data/profile";

interface ContactStripProps {
  language: SupportedLanguages;
}

const RESUME_LABELS: Record<SupportedLanguages, string> = {
  pt: "Currículo",
  en: "Resume",
  de: "Lebenslauf",
};

const RESUME_FILES: Record<SupportedLanguages, { href: string; download: string }> = {
  pt: { href: "/curriculo-marco-aurelio.pdf", download: "Curriculo-Marco-Aurelio-Menezes.pdf" },
  en: { href: "/resume-marco-aurelio.pdf", download: "Resume-Marco-Aurelio-Menezes.pdf" },
  de: { href: "/lebenslauf-marco-aurelio.pdf", download: "Lebenslauf-Marco-Aurelio-Menezes.pdf" },
};

export function ContactStrip({ language }: ContactStripProps) {
  const resume = RESUME_FILES[language];

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = resume.href;
    link.download = resume.download;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <a
        href={profile.linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors whitespace-nowrap"
        aria-label="LinkedIn profile"
      >
        <Linkedin className="w-3 h-3 flex-shrink-0" />
        <span>LinkedIn</span>
      </a>

      <span className="text-header-text-muted">|</span>

      <a
        href={profile.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors whitespace-nowrap"
        aria-label="GitHub profile"
      >
        <Github className="w-3 h-3 flex-shrink-0" />
        <span>GitHub</span>
      </a>

      <span className="text-header-text-muted">|</span>

      <button
        onClick={handleDownload}
        className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors whitespace-nowrap"
        aria-label={`Download ${RESUME_LABELS[language]}`}
      >
        <Download className="w-3 h-3 flex-shrink-0" />
        <span>{RESUME_LABELS[language]}</span>
      </button>
    </>
  );
}
