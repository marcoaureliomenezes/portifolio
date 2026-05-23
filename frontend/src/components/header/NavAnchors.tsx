/**
 * NavAnchors — in-page section navigation.
 *
 * Desktop (lg:): inline anchor links in the header bar.
 * Mobile: hamburger [☰] button opens a right-side Sheet drawer with
 *         the same anchor links + ThemeToggle + LanguageSelector.
 */

import { useState } from "react";
import { Menu } from "lucide-react";
import { useContent } from "@/hooks/useContent";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelector } from "./LanguageSelector";
import type { SupportedLanguages } from "@/types/content";

interface NavAnchor {
  anchor: string;
  labelKey: "experienceTitle" | "certificationsTitle" | "skillsTitle";
}

const NAV_ANCHORS: NavAnchor[] = [
  { anchor: "experiencia", labelKey: "experienceTitle" },
  { anchor: "certificacoes", labelKey: "certificationsTitle" },
  { anchor: "habilidades", labelKey: "skillsTitle" },
];

interface NavAnchorsProps {
  language: SupportedLanguages;
  onLanguageChange: (language: SupportedLanguages) => void;
}

function AnchorLink({
  anchor,
  label,
  onClick,
}: {
  anchor: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={`#${anchor}`}
      onClick={(e) => {
        e.preventDefault();
        const target = document.getElementById(anchor);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.location.hash = `#${anchor}`;
        }
        onClick?.();
      }}
      className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-semibold text-header-link hover:text-header-text hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {label}
    </a>
  );
}

export function NavAnchors({ language, onLanguageChange }: NavAnchorsProps) {
  const { content } = useContent();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      {/* Desktop: inline nav anchors (lg: breakpoint) */}
      <nav
        aria-label="Section navigation"
        className="hidden lg:flex items-center gap-1"
      >
        {NAV_ANCHORS.map(({ anchor, labelKey }) => (
          <AnchorLink
            key={anchor}
            anchor={anchor}
            label={content[labelKey]}
          />
        ))}
      </nav>

      {/* Mobile: hamburger + Sheet drawer */}
      <div className="flex lg:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Menu"
              aria-expanded={sheetOpen}
              aria-controls="mobile-nav-drawer"
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-md text-header-text hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </SheetTrigger>
          <SheetContent
            id="mobile-nav-drawer"
            side="right"
            className="bg-header-bg text-header-text border-header-text/20 w-72 p-0"
          >
            <div className="flex flex-col h-full p-6 gap-6">
              <nav
                aria-label="Section navigation"
                className="flex flex-col gap-2"
              >
                {NAV_ANCHORS.map(({ anchor, labelKey }) => (
                  <AnchorLink
                    key={anchor}
                    anchor={anchor}
                    label={content[labelKey]}
                    onClick={() => setSheetOpen(false)}
                  />
                ))}
              </nav>

              <div className="border-t border-header-text/20 pt-4 flex items-center gap-3">
                <ThemeToggle />
                <LanguageSelector
                  language={language}
                  onLanguageChange={onLanguageChange}
                  compact
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
