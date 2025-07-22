import { useState } from "react";
import { User, Briefcase, GraduationCap, Award } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  language: string;
}

const menuItems = {
  pt: [
    { title: "Experiência Profissional", anchor: "experiencia", icon: Briefcase },
    { title: "Educação", anchor: "educacao", icon: GraduationCap },
    { title: "Certificações", anchor: "certificacoes", icon: Award },
    { title: "Habilidades", anchor: "habilidades", icon: User },
  ],
  en: [
    { title: "Professional Experience", anchor: "experiencia", icon: Briefcase },
    { title: "Education", anchor: "educacao", icon: GraduationCap },
    { title: "Certifications", anchor: "certificacoes", icon: Award },
    { title: "Skills", anchor: "habilidades", icon: User },
  ]
};

export function AppSidebar({ language }: AppSidebarProps) {
  const { open } = useSidebar();
  const [activeSection, setActiveSection] = useState("");

  const items = language === "Português" ? menuItems.pt : menuItems.en;

  const scrollToSection = (anchor: string) => {
    const element = document.getElementById(anchor);
    if (element) {
      const headerHeight = 120; // Altura aproximada do header
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
              {items.map((item) => (
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