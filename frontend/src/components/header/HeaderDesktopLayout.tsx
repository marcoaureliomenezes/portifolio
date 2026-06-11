import { NavLink } from "react-router-dom";
import type { SupportedLanguages, HeaderInfo } from "@/types/content";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";
import { NavAnchors } from "./NavAnchors";

interface HeaderDesktopLayoutProps {
  /** kept for backward-compat; not rendered in the slim header */
  name?: string;
  /** kept for backward-compat; not rendered in the slim header */
  email?: string;
  /** kept for backward-compat; not rendered in the slim header */
  avatarUrl?: string;
  language: SupportedLanguages;
  onLanguageChange: (language: SupportedLanguages) => void;
  /** kept for backward-compat; not rendered in the slim header */
  headerInfo?: HeaderInfo;
  /** kept for backward-compat; not rendered in the slim header */
  viewLarger?: string;
  /** i18n label for the "Projetos" nav link (T-PC-C-04). */
  navProjects: string;
}

export function HeaderDesktopLayout({
  language,
  onLanguageChange,
  navProjects,
  avatarUrl,
  name,
}: HeaderDesktopLayoutProps) {
  return (
    <div className="hidden md:flex items-center justify-between h-[72px] px-6 container mx-auto max-w-4xl">
      {/* Left — name only (foto está no hero) */}
      <a
        href="#main-content"
        className="font-bold text-sm text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        Marco Menezes
      </a>

      {/* Right — nav anchors + personal projects + controls */}
      <div className="flex items-center gap-3">
        <NavAnchors language={language} onLanguageChange={onLanguageChange} />
        <nav aria-label="Navegação principal">
          <NavLink
            to="/projetos"
            className={({ isActive }) =>
              [
                "inline-flex min-h-9 items-center rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                isActive
                  ? "bg-accent text-accent-foreground shadow-soft"
                  : "border border-header-link/40 text-header-link hover:border-accent hover:bg-white/10 hover:text-header-text",
              ].join(" ")
            }
          >
            {navProjects}
          </NavLink>
        </nav>
        <ThemeToggle />
        <LanguageSelector language={language} onLanguageChange={onLanguageChange} />
      </div>
    </div>
  );
}
