import type { SupportedLanguages, HeaderInfo } from "@/types/content";
import { NavAnchors } from "./NavAnchors";

type ScrollState = "full" | "intermediate" | "compact";

interface HeaderMobileLayoutProps {
  language: SupportedLanguages;
  onLanguageChange: (language: SupportedLanguages) => void;
  /** kept for backward-compat; not rendered in the slim mobile header */
  name?: string;
  /** kept for backward-compat; not rendered in the slim mobile header */
  email?: string;
  /** kept for backward-compat; not rendered in the slim mobile header */
  avatarUrl?: string;
  /** kept for backward-compat; not rendered in the slim mobile header */
  headerInfo?: HeaderInfo;
  /** kept for backward-compat; not rendered in the slim mobile header */
  scrollState?: ScrollState;
  /** kept for backward-compat; not rendered in the slim mobile header */
  viewLarger?: string;
  /** kept for backward-compat; not rendered in the slim mobile header */
  navProjects?: string;
}

export function HeaderMobileLayout({
  language,
  onLanguageChange,
  avatarUrl,
  name,
}: HeaderMobileLayoutProps) {
  return (
    <div className="flex md:hidden items-center justify-between h-16 px-4">
      {/* Left — name only */}
      <a
        href="#main-content"
        className="font-bold text-sm text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        Marco Menezes
      </a>

      {/* Right — hamburger drawer (contains ThemeToggle, LanguageSelector, nav anchors) */}
      <NavAnchors language={language} onLanguageChange={onLanguageChange} />
    </div>
  );
}
