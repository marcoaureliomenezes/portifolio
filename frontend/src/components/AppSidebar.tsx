import { useState } from "react";
import { User, Briefcase, GraduationCap, Award } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { getContent, SupportedLanguages } from "@/data/content";

interface AppSidebarProps {
  language: string;
}

export function AppSidebar({ language }: AppSidebarProps) {
  const [activeSection, setActiveSection] = useState("");

  const currentContent = getContent(language as SupportedLanguages);

  const menuItems = [
    { title: currentContent.nav.experience, anchor: "experiencia", icon: Briefcase },
    { title: currentContent.nav.education, anchor: "educacao", icon: GraduationCap },
    { title: currentContent.nav.certifications, anchor: "certificacoes", icon: Award },
    { title: currentContent.nav.skills, anchor: "habilidades", icon: User },
  ];

  const scrollToSection = (anchor: string) => {
    const element = document.getElementById(anchor);
    if (element) {
      const headerHeight = 120;
      const elementPosition = element.offsetTop - headerHeight;

      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });

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
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.anchor}>
                  <SidebarMenuButton
                    onClick={() => scrollToSection(item.anchor)}
                    className={`cursor-pointer ${getNavCls(item.anchor)}`}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
