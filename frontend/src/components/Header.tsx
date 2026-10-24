import { NavLink } from "react-router-dom";
import { useContent } from "@/hooks/useContent";
import { LanguageSelector } from "./header/LanguageSelector";
import { ThemeToggle } from "./header/ThemeToggle";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  "flex h-full items-center border-b-2 text-body transition-colors " +
  (isActive
    ? "border-accent text-header-text"
    : "border-transparent text-header-text/70 hover:text-header-text");

export const Header = () => {
  const { content, language, setLanguage } = useContent();
  const { nav } = content.siteChrome!;

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-[var(--header-h)] bg-header-bg text-header-text shadow-lg">
      <div className="container mx-auto flex h-full flex-wrap items-center justify-between px-5 md:px-8">
        <span className="text-item">Marco Menezes</span>
        <div className="flex items-center gap-2 md:order-last">
          <ThemeToggle />
          <LanguageSelector language={language} onLanguageChange={setLanguage} compact />
        </div>
        <nav
          aria-label={nav.label}
          className="flex h-8 w-full gap-7 md:ml-auto md:mr-6 md:h-full md:w-auto"
        >
          <NavLink to="/" end className={linkClass}>
            {nav.resume}
          </NavLink>
          <NavLink to="/projetos" className={linkClass}>
            {nav.projects}
          </NavLink>
        </nav>
      </div>
    </header>
  );
};
