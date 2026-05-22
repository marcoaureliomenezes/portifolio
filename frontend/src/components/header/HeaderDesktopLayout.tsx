import { MapPin, Mail } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { SupportedLanguages, HeaderInfo } from "@/types/content";
import { LanguageSelector } from "./LanguageSelector";
import { ContactStrip } from "./ContactStrip";
import { AvatarImageModal } from "./AvatarImageModal";
import { EmailModal } from "./EmailModal";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderDesktopLayoutProps {
  name: string;
  email: string;
  avatarUrl: string;
  language: SupportedLanguages;
  onLanguageChange: (language: SupportedLanguages) => void;
  headerInfo: HeaderInfo;
  viewLarger: string;
  /** i18n label for the "Projetos" nav link (T-PC-C-04). */
  navProjects: string;
}

export function HeaderDesktopLayout({
  name,
  email,
  avatarUrl,
  language,
  onLanguageChange,
  headerInfo,
  viewLarger,
  navProjects,
}: HeaderDesktopLayoutProps) {
  const avatarTrigger = (
    <button className="group relative">
      <img
        src={avatarUrl}
        alt={`Foto de ${name}`}
        className="w-20 h-20 lg:w-24 lg:h-24 rounded-full object-cover object-top border-2 border-header-text/20 transition-all duration-300 group-hover:border-header-text/40 cursor-pointer"
      />
      <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <span className="text-header-text text-xs">{viewLarger}</span>
      </div>
    </button>
  );

  const emailTrigger = (
    <button className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors whitespace-nowrap">
      <Mail className="w-3 h-3 flex-shrink-0" />
      <span>{headerInfo.viewEmail}</span>
    </button>
  );

  return (
    <div className="hidden md:block relative">
      <div className="absolute top-2 right-0 z-10 flex items-center gap-2">
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

      <div className="container mx-auto px-4 max-w-4xl md:ml-0">
        <div className="flex items-center gap-8 py-2">
          <div className="flex-shrink-0">
            <AvatarImageModal avatarUrl={avatarUrl} name={name} trigger={avatarTrigger} />
          </div>

          <div className="text-left space-y-1">
            <h1 className="text-xl lg:text-2xl font-bold text-header-text">{name}</h1>
            <p className="text-sm lg:text-base text-header-text-muted">{headerInfo.title}</p>

            <div className="flex items-center gap-3 text-xs lg:text-sm flex-wrap">
              <div className="flex items-center gap-1 text-header-text-muted whitespace-nowrap">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span>{headerInfo.location}</span>
              </div>

              <span className="text-header-text-muted">|</span>

              <EmailModal email={email} trigger={emailTrigger} />

              <span className="text-header-text-muted">|</span>

              <ContactStrip language={language} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
