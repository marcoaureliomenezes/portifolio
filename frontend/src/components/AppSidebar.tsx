import { useState } from "react";
import { User, Briefcase, GraduationCap, Award } from "lucide-react";
import { useContent } from "@/hooks/useContent";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

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
      setActiveSection(anchor);
    }
  };

  const getNavCls = (anchor: string) =>
    activeSection === anchor
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "hover:bg-white hover:text-black hover:shadow-lg hover:shadow-black/20 transition-all duration-300";

  return (
    <Sidebar
      className="hidden md:flex w-60 border-r border-sidebar-border fixed top-32 bottom-0 left-0 z-20"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <nav aria-label="primary">
              <SidebarMenu>
                {SECTION_ANCHORS.map(({ anchor, labelKey, icon: Icon }) => (
                  <SidebarMenuItem key={anchor}>
                    <SidebarMenuButton
                      onClick={() => scrollToSection(anchor)}
                      className={`cursor-pointer ${getNavCls(anchor)}`}
                      aria-current={activeSection === anchor ? "location" : undefined}
                    >
                      <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                      <span>{content[labelKey]}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
