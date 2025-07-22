import { useState } from "react";
import { Header } from "@/components/Header";
import { Portfolio } from "@/components/Portfolio";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Index = () => {
  const [language, setLanguage] = useState("Português");

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background w-full">
        {/* Header fixo com trigger do sidebar */}
        <Header 
          language={language}
          onLanguageChange={handleLanguageChange}
        />
        
        <div className="flex w-full">
          {/* Sidebar apenas no desktop */}
          <AppSidebar language={language} />
          
          {/* Conteúdo principal */}
          <main className="flex-1">
            <Portfolio language={language} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
