import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useContent } from "@/hooks/useContent";
import profileAvatar from "@/assets/profile.webp";
import { profile } from "@/data/profile";
import { HeaderDesktopLayout } from "./HeaderDesktopLayout";
import { HeaderMobileLayout } from "./HeaderMobileLayout";

type ScrollState = "full" | "intermediate" | "compact";

export function HeaderShell() {
  const isMobile = useIsMobile();
  const [scrollState, setScrollState] = useState<ScrollState>("full");
  const { content, language, setLanguage } = useContent();

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
    name: profile.name,
    email: profile.email,
    avatarUrl: profileAvatar,
    language,
    onLanguageChange: setLanguage,
    headerInfo: content.header,
  };

  const blurClass =
    scrollState !== "full" ? "backdrop-blur-md bg-header-bg/85" : "";

  return (
    <header className="fixed top-0 left-0 right-0 bg-header-bg text-header-text w-full z-30 transition-all duration-300 shadow-lg border-b border-white/5">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 transition-all duration-300">
        <div className={blurClass}>
          {isMobile ? (
            <HeaderMobileLayout {...sharedProps} scrollState={scrollState} />
          ) : (
            <HeaderDesktopLayout {...sharedProps} />
          )}
        </div>
      </div>
    </header>
  );
}
