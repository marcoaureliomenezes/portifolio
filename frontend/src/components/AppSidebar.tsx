import { useState } from "react";
import { User, Briefcase, GraduationCap, Award } from "lucide-react";
import { useContent } from "@/hooks/useContent";

const SECTION_ANCHORS = [
  { anchor: "experiencia", labelKey: "experienceTitle" as const, icon: Briefcase },
  { anchor: "educacao", labelKey: "educationTitle" as const, icon: GraduationCap },
  { anchor: "certificacoes", labelKey: "certificationsTitle" as const, icon: Award },
  { anchor: "habilidades", labelKey: "skillsTitle" as const, icon: User },
] as const;

export function AppSidebar() {
  const { content } = useContent();
  const [activeSection, setActiveSection] = useState("");

  const scrollToSection = (anchor: string) => {
    const element = document.getElementById(anchor);
    if (element) {
      const headerHeight = 120;
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({ top: elementPosition, behavior: "smooth" });
    }
    setActiveSection(anchor);
  };

  return (
    <nav
      aria-label="primary"
      className="hidden md:flex flex-col w-60 border-r border-sidebar-border fixed top-32 bottom-0 left-0 z-20 bg-sidebar pt-4"
    >
      <ul role="list" className="flex flex-col gap-1 px-2">
        {SECTION_ANCHORS.map(({ anchor, labelKey, icon: Icon }) => {
          const isActive = activeSection === anchor;
          return (
            <li key={anchor}>
              <button
                onClick={() => scrollToSection(anchor)}
                aria-current={isActive ? "location" : undefined}
                className={[
                  "flex items-center w-full rounded-md px-3 py-2 text-sm transition-all duration-300",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "hover:bg-white hover:text-black hover:shadow-lg hover:shadow-black/20",
                ].join(" ")}
              >
                <Icon className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{content[labelKey]}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
