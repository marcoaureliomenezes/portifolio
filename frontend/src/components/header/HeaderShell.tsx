import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { SupportedLanguages, HeaderInfo } from "@/types/content";
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

  const sharedProps = {
    name,
    email,
    avatarUrl,
    language,
    onLanguageChange,
    headerInfo,
  };

  return (
    <>
      {isMobile ? (
        <HeaderMobileLayout {...sharedProps} scrollState={scrollState} />
      ) : (
        <HeaderDesktopLayout {...sharedProps} />
      )}
    </>
  );
}
