import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useContent } from "@/hooks/useContent";
import type { SupportedLanguages, HeaderInfo } from "@/types/content";
import { headerNavRoutes } from "@/routes";
import { HeaderDesktopLayout } from "./HeaderDesktopLayout";
import { HeaderMobileLayout } from "./HeaderMobileLayout";

type ScrollState = "full" | "intermediate" | "compact";

interface HeaderShellProps {
  name: string;
  email: string;
  avatarUrl: string;
  language: SupportedLanguages;
  onLanguageChange: (language: SupportedLanguages) => void;
  headerInfo: HeaderInfo;
}

export function HeaderShell({
  name,
  email,
  avatarUrl,
  language,
  onLanguageChange,
  headerInfo,
}: HeaderShellProps) {
  const isMobile = useIsMobile();
  const { content } = useContent();
  const [scrollState, setScrollState] = useState<ScrollState>("full");

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop === 0) {
        setScrollState("full");
      } else if (scrollTop < 100) {
        setScrollState("intermediate");
      } else {
        setScrollState("compact");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /** Resolve the localized label for a route given its labelKey (e.g. "nav.projects"). */
  function resolveNavLabel(labelKey: string): string {
    const [section, key] = labelKey.split(".");
    if (section === "nav" && key && content.nav) {
      const navLabels = content.nav as Record<string, string>;
      return navLabels[key] ?? key;
    }
    return labelKey;
  }

  const sharedProps = {
    name,
    email,
    avatarUrl,
    language,
    onLanguageChange,
    headerInfo,
    navItems: headerNavRoutes.map((r) => ({
      path: r.path,
      label: resolveNavLabel(r.labelKey),
    })),
  };

  const blurClass =
    scrollState !== "full" ? "backdrop-blur-md bg-header-bg/85" : "";

  return (
    <div className={blurClass}>
      {isMobile ? (
        <HeaderMobileLayout {...sharedProps} scrollState={scrollState} />
      ) : (
        <HeaderDesktopLayout {...sharedProps} />
      )}
    </div>
  );
}
